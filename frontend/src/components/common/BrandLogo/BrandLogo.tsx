import styles from "./BrandLogo.module.css";

type BrandLogoSize = "sm" | "md" | "lg";

type BrandLogoProps = {
  size?: BrandLogoSize;
  className?: string;
};

export default function BrandLogo({ size = "md", className }: BrandLogoProps) {
  const classNames = [styles.logo, styles[size], className]
    .filter(Boolean)
    .join(" ");

  return <span className={classNames}>골라드림</span>;
}
