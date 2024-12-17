import { NavItem } from "epubjs";

function normalizeLabel(label: string): string {
  return label
    .trim()
    // Replace newlines and spaces with a single dash
    .replace(/[\s\n]+/g, '-')
    // Replace any non-alphanumeric characters (except dashes) with a dash
    .replace(/[^a-zA-Z0-9-]/g, '-')
    // Replace multiple consecutive dashes with a single dash
    .replace(/-+/g, '-')
    // Remove leading and trailing dashes
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export function findNavItemByHref(navigation: NavItem[], href: string): NavItem | undefined {
  return navigation.find(item => item.href === href || href.includes(item.href));
}

export function findNavItemByLabel(navigation: NavItem[], label: string): NavItem | undefined {
  const normalizedSearchLabel = normalizeLabel(label);
  return navigation.find(item => normalizeLabel(item.label) === normalizedSearchLabel);
}

export function encodeLocation(navItem: NavItem | undefined, fallbackHref: string): string {
  return navItem ? normalizeLabel(navItem.label) : fallbackHref;
}

export function decodeLocation(navigation: NavItem[], hash: string): string {
  const navItem = findNavItemByLabel(navigation, hash);
  return navItem?.href || hash;
}
