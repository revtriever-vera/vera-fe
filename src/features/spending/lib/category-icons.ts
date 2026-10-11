import {
    ArrowLeftRight,
    Baby,
    BookOpen,
    Briefcase,
    Car,
    CircleEllipsis,
    CirclePlus,
    Coffee,
    CreditCard,
    Dumbbell,
    Film,
    Gift,
    HeartPulse,
    House,
    Landmark,
    PawPrint,
    PiggyBank,
    Plane,
    Repeat,
    ShoppingBag,
    ShoppingCart,
    TrendingUp,
    UtensilsCrossed,
    Wrench,
    type LucideIcon
} from 'lucide-react';
import { ICON_KEYS, type IconKey } from '../types';

export const CATEGORY_ICONS: Readonly<Record<IconKey, LucideIcon>> = {
    Home: House,
    BookOpen,
    HeartPulse,
    Wrench,
    Landmark,
    ShoppingCart,
    UtensilsCrossed,
    Car,
    Film,
    Repeat,
    ShoppingBag,
    CircleEllipsis,
    TrendingUp,
    PlusCircle: CirclePlus,
    ArrowLeftRight,
    CreditCard,
    PiggyBank,
    Coffee,
    Dumbbell,
    PawPrint,
    Plane,
    Gift,
    Baby,
    Briefcase
};

export function isIconKey(value: string): value is IconKey {
    return (ICON_KEYS as readonly string[]).includes(value);
}

export function categoryIcon(icon: string): LucideIcon {
    return isIconKey(icon) ? CATEGORY_ICONS[icon] : CircleEllipsis;
}
