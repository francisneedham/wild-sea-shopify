import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Compass,
  Fish,
  MapPin,
  Menu,
  Minus,
  Play,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  UserRound,
  UsersRound,
  X,
  CalendarDays,
  Sun,
  ArrowDown,
  WavesHorizontal,
  Wind,
  Check,
  Download,
  Maximize2,
  createIcons,
} from 'lucide';

const icons = { CalendarDays, Sun, ArrowDown, WavesHorizontal, Wind, Check, Download, Maximize2, ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, ChevronRight, Compass, Fish, MapPin, Menu, Minus, Play, Plus, Search, ShieldCheck, ShoppingBag, SlidersHorizontal, UserRound, UsersRound, X };

export function hydrateIcons(root: Element | Document = document): void {
  createIcons({ icons, root, attrs: { 'aria-hidden': 'true', focusable: 'false' } });
}
