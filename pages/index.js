import Head from 'next/head';
import Snake from '../components/Snake';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>贪吃蛇游戏 | Next.js</title>
        <meta name="description" content="使用Next.js实现的贪吃蛇小游戏" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          贪吃蛇小游戏
        </h1>

        <p className={styles.description}>
          使用方向键控制蛇的移动，空格键暂停/继续游戏
        </p>

        <Snake />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/WuKunQ/snake"
          target="_blank"
          rel="noopener noreferrer"
        >
          在GitHub上查看源码
        </a>
      </footer>
    </div>
  );
}