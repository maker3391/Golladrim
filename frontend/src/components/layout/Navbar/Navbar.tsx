import BrandLogo from "@/components/common/BrandLogo/BrandLogo";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>
        <BrandLogo size="md" />
      </div>

      <div className={styles.actions}>
        <button className={styles.favoriteButton}>즐겨찾기</button>
        <button className={styles.loginButton}>로그인</button>
        <button className={styles.signupButton}>회원가입</button>
      </div>
    </header>
  );
}
