export interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
}
export interface ButtonProps {
  variant?: 'primary' | 'outline';
  children: React.ReactNode;
  href?: string;
  className?: string;
}
