"""Import the reviewed catalog through Shopify CLI; checkpoint every remote write."""
import argparse
import json
import os
import subprocess
import time
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RUN = ROOT / 'data/catalog/live-run'
OPS = ROOT / 'data/catalog/operations'
STORE = 'wild-sea-expeditions-fvadj9fv.myshopify.com'
LOCATION = 'gid://shopify/Location/80787898481'

def read(path):
    return json.loads(path.read_text())

def write(path, value):
    temp = path.with_suffix(path.suffix + '.tmp')
    temp.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')
    temp.replace(path)

def execute(operation, variables, stem, mutation=False):
    request = RUN / f'{stem}.{operation}.request.json'
    result = RUN / f'{stem}.{operation}.response.json'
    write(request, variables)
    command = ['bunx', '--bun', '@shopify/cli@latest', 'store', 'execute', '--store', STORE,
               '--query-file', str(OPS / (operation + '.graphql')), '--variable-file', str(request),
               '--version', '2026-10', '--json', '--no-input', '--output-file', str(result)]
    if mutation:
        command.append('--allow-mutations')
    environment = os.environ.copy()
    environment['SHOPIFY_CLI_AGENT_INFO'] = 'n:codex|v:none|p:openai|m:gpt-6'
    process = subprocess.run(command, cwd=ROOT, env=environment, capture_output=True, text=True, timeout=120)
    if process.returncode:
        raise RuntimeError(f'{operation} {stem}: {(process.stderr or process.stdout)[-1800:]}')
    data = read(result)
    if data.get('errors'):
        raise RuntimeError(str(data['errors']))
    return data

def published_ids(product):
    return {node['publication']['id'] for node in product['resourcePublicationsV2']['nodes'] if node['isPublished']}

def verify(product, expected):
    assert product and product['handle'] == expected['handle'].strip('-'), 'Product identity mismatch'
    assert product['status'] == 'ACTIVE' and product['title'] == expected['title'], 'Product status/title mismatch'
    assert not product['variants']['pageInfo']['hasNextPage'], 'Variant pagination incomplete'
    variants = {v['sku']:v for v in product['variants']['nodes']}
    assert set(variants) == {v['sku'] for v in expected['variants']}, 'SKU mismatch'
    for source in expected['variants']:
        variant = variants[source['sku']]
        assert Decimal(variant['price']) == Decimal(source['price']), f"Price mismatch {source['sku']}"
        assert Decimal(variant['compareAtPrice'] or '0') == Decimal(source.get('compareAtPrice') or '0'), 'Sale mismatch'
        assert variant['inventoryPolicy'] == 'DENY', 'Inventory policy mismatch'
        actual = [(o['name'],o['value']) for o in variant['selectedOptions']]
        wanted = [(o['optionName'],o['name']) for o in source['optionValues']]
        assert actual == wanted, f"Option mismatch {source['sku']}: {actual} != {wanted}"
        item = variant['inventoryItem']
        assert item['tracked'] and item['requiresShipping'], 'Inventory/shipping mismatch'
        assert item['inventoryLevel'] and item['inventoryLevel']['quantities'][0]['quantity'] == source['inventoryQuantities'][0]['quantity'], 'Stock mismatch'
        weight = item['measurement']['weight']
        factors = {'KILOGRAMS':Decimal(1),'GRAMS':Decimal('.001'),'POUNDS':Decimal('.45359237'),'OUNCES':Decimal('.028349523125')}
        wanted_weight = Decimal(str(source['inventoryItem']['measurement']['weight']['value']))
        assert weight and abs(Decimal(str(weight['value'])) * factors[weight['unit']] - wanted_weight) < Decimal('.000001'), 'Weight mismatch'
    assert not product['media']['pageInfo']['hasNextPage'], 'Media pagination incomplete'
    assert len(product['media']['nodes']) <= len(expected['files']), 'Unexpected extra product media'
    pending = [m for m in product['media']['nodes'] if m['status'] != 'READY']
    if len(product['media']['nodes']) < len(expected['files']):
        pending.append({'status':'MISSING','expected':len(expected['files']),'actual':len(product['media']['nodes'])})
    return pending

def run(limit=None):
    payloads = read(RUN / 'payloads.json')
    state_path = RUN / 'journal.json'
    state = read(state_path) if state_path.exists() else {'store':STORE,'products':{}}
    current = execute('preflight', {}, 'current-preflight')
    assert current['shop']['myshopifyDomain'] == STORE and current['shop']['currencyCode'] == 'EUR', 'Wrong store or currency'
    locations = [l for l in current['locations']['nodes'] if l['isActive'] and l['fulfillsOnlineOrders']]
    assert len(locations) == 1 and locations[0]['id'] == LOCATION, 'Inventory location changed'
    channels = current['publications']['nodes']
    channel_ids = {p['id'] for p in channels}
    assert channel_ids, 'No sales channel publications available'
    state['publications'] = channels
    write(state_path, state)
    existing = execute('catalog-summary', {}, 'before-import')
    assert not existing['products']['pageInfo']['hasNextPage'], 'Existing catalog requires pagination before import'
    existing = {p['handle']:p for p in existing['products']['nodes']}
    for index, payload in enumerate(payloads[:limit], 1):
        handle, expected = payload['handle'], payload['input']
        entry = state['products'].setdefault(handle, {})
        if channel_ids <= set(entry.get('published_channels', [])):
            continue
        product = None
        if not entry.get('id'):
            saved = RUN / f'{handle}.create.result.json'
            response = RUN / f'{handle}.create-product.response.json'
            attempt = RUN / f'{handle}.create.attempt.json'
            if saved.exists() or response.exists():
                result = read(saved if saved.exists() else response)['productSet']
            elif handle.strip('-') in existing:
                if not attempt.exists():
                    raise RuntimeError(f'Existing untracked product collision: {handle}')
                entry['id'] = existing[handle.strip('-')]['id']
                result = None
            else:
                if attempt.exists():
                    raise RuntimeError(f'Unknown prior creation outcome for {handle}; reconcile before retrying')
                write(attempt, {'handle':handle,'started_at':time.time()})
                result = execute('create-product', {'input':expected,'locationId':LOCATION}, handle, True)['productSet']
            if result is not None:
                if result['product']:
                    entry['id'] = result['product']['id']
                    write(state_path, state)
                if result['userErrors']:
                    raise RuntimeError(str(result['userErrors']))
                product = result['product'] if 'variants' in result['product'] else None
            write(state_path, state)
        variables = {'id':entry['id'],'locationId':LOCATION}
        if product is None:
            product = execute('verify-product', variables, handle)['product']
        pending = verify(product, expected)
        failed = [m for m in pending if m['status'] == 'FAILED']
        if failed:
            raise RuntimeError(f'Media failed before publication: {handle}: {failed}')
        missing = channel_ids - published_ids(product)
        if missing:
            published = execute('publish-product', {'id':entry['id'],'publications':[{'publicationId':p} for p in sorted(missing)]}, handle, True)['publishablePublish']
            if published['userErrors']:
                raise RuntimeError(str(published['userErrors']))
            assert channel_ids <= published_ids(published['publishable']), 'Channel publication incomplete'
        entry.update(title=payload['title'],shopify_handle=product['handle'],published_channels=sorted(channel_ids),variants=len(expected['variants']),images=len(expected['files']),stock=sum(v['inventoryQuantities'][0]['quantity'] for v in expected['variants']),media_pending=len(pending))
        write(state_path, state)
        print(json.dumps({'progress':f'{index}/{len(payloads)}','title':payload['title'],'channels':len(channel_ids),'variants':entry['variants'],'stock':entry['stock'],'media_pending':len(pending)}), flush=True)
    if limit:
        return
    unresolved = []
    for index,payload in enumerate(payloads,1):
        entry = state['products'][payload['handle']]
        product = execute('verify-product', {'id':entry['id'],'locationId':LOCATION}, 'audit-'+payload['handle'])['product']
        pending = verify(product,payload['input'])
        assert channel_ids <= published_ids(product), 'Final channel verification failed'
        entry['media_pending'] = len(pending)
        if pending:
            unresolved.append({'handle':payload['handle'],'media':pending})
        write(state_path,state)
        if index % 10 == 0:print(json.dumps({'audit':f'{index}/{len(payloads)}','unresolved_media_products':len(unresolved)}),flush=True)
    summary = execute('catalog-summary',{},'after-import')
    assert not summary['products']['pageInfo']['hasNextPage'], 'Final catalog requires pagination'
    assert summary['productsCount']['count'] == 87 and summary['productVariantsCount']['count'] == 336, 'Final catalog count mismatch'
    assert sum(p['totalInventory'] for p in summary['products']['nodes']) == 407, 'Final inventory sum mismatch'
    assert all(p['status']=='ACTIVE' and channel_ids <= published_ids(p) for p in summary['products']['nodes']), 'Final channel status mismatch'
    state['result'] = {'products':87,'variants':336,'stock_units':407,'image_references':388,'channels':channels,'unresolved_media':unresolved,'completed_at':time.time()}
    write(state_path,state)
    print(json.dumps(state['result']),flush=True)

if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--execute',action='store_true',required=True)
    parser.add_argument('--limit',type=int)
    args=parser.parse_args()
    run(args.limit)
