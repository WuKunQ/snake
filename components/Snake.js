import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Snake.module.css';

const Snake = () => {
  // 游戏区域大小
  const gridSize = 20;
  const gridWidth = 20;
  const gridHeight = 20;
  
  // 游戏状态
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(150);
  const [isPaused, setIsPaused] = useState(false);
  
  // 用于游戏循环的ref
  const gameLoopRef = useRef();
  
  // 生成随机食物位置
  const generateFood = () => {
    const newFood = {
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight)
    };
    
    // 确保食物不会出现在蛇身上
    const isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    if (isOnSnake) {
      return generateFood();
    }
    
    return newFood;
  };
  
  // 检查碰撞
  const checkCollision = (head) => {
    // 检查是否撞墙
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
      return true;
    }
    
    // 检查是否撞到自己（除了头部）
    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        return true;
      }
    }
    
    return false;
  };
  
  // 移动蛇
  const moveSnake = () => {
    if (isPaused || gameOver) return;
    
    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    
    // 根据方向移动头部
    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
      default:
        break;
    }
    
    // 检查碰撞
    if (checkCollision(head)) {
      setGameOver(true);
      return;
    }
    
    // 添加新头部
    newSnake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
      // 增加分数
      setScore(prevScore => prevScore + 10);
      
      // 增加速度（每50分加快一次）
      if (score > 0 && score % 50 === 0) {
        setSpeed(prevSpeed => Math.max(prevSpeed - 10, 50));
      }
      
      // 生成新食物
      setFood(generateFood());
    } else {
      // 如果没吃到食物，移除尾部
      newSnake.pop();
    }
    
    setSnake(newSnake);
  };
  
  // 处理键盘输入
  const handleKeyDown = (e) => {
    // 防止方向键滚动页面
    if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
      e.preventDefault();
    }
    
    // 空格键暂停/继续游戏
    if (e.keyCode === 32) {
      setIsPaused(prev => !prev);
      return;
    }
    
    // 游戏结束或暂停时不处理方向键
    if (gameOver || isPaused) return;
    
    // 处理方向键
    switch (e.keyCode) {
      case 38: // 上箭头
        if (direction !== 'DOWN') setDirection('UP');
        break;
      case 40: // 下箭头
        if (direction !== 'UP') setDirection('DOWN');
        break;
      case 37: // 左箭头
        if (direction !== 'RIGHT') setDirection('LEFT');
        break;
      case 39: // 右箭头
        if (direction !== 'LEFT') setDirection('RIGHT');
        break;
      default:
        break;
    }
  };
  
  // 重置游戏
  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setSpeed(150);
    setIsPaused(false);
  };
  
  // 初始化游戏和键盘事件监听
  useEffect(() => {
    // 添加键盘事件监听
    window.addEventListener('keydown', handleKeyDown);
    
    // 清理函数
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(gameLoopRef.current);
    };
  }, [direction, gameOver, isPaused]);
  
  // 游戏循环
  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, speed);
    return () => clearInterval(gameLoopRef.current);
  }, [snake, food, direction, gameOver, isPaused, speed]);
  
  return (
    <div className={styles.gameContainer}>
      <div className={styles.scoreBoard}>
        <div>分数: {score}</div>
        {isPaused && <div className={styles.pausedText}>已暂停</div>}
      </div>
      
      <div 
        className={styles.gameBoard}
        style={{
          gridTemplateColumns: `repeat(${gridWidth}, ${gridSize}px)`,
          gridTemplateRows: `repeat(${gridHeight}, ${gridSize}px)`,
          width: `${gridWidth * gridSize}px`,
          height: `${gridHeight * gridSize}px`
        }}
      >
        {/* 渲染蛇 */}
        {snake.map((segment, index) => (
          <div
            key={`${segment.x}-${segment.y}`}
            className={`${styles.snakeSegment} ${index === 0 ? styles.snakeHead : ''}`}
            style={{
              gridColumnStart: segment.x + 1,
              gridRowStart: segment.y + 1
            }}
          />
        ))}
        
        {/* 渲染食物 */}
        <div
          className={styles.food}
          style={{
            gridColumnStart: food.x + 1,
            gridRowStart: food.y + 1
          }}
        />
        
        {/* 游戏结束覆盖层 */}
        {gameOver && (
          <div className={styles.gameOverOverlay}>
            <h2>游戏结束!</h2>
            <p>最终得分: {score}</p>
            <button onClick={resetGame}>再玩一次</button>
          </div>
        )}
      </div>
      
      <div className={styles.controls}>
        <p>使用方向键控制蛇的移动</p>
        <p>空格键暂停/继续游戏</p>
        {(gameOver || isPaused) && (
          <button onClick={resetGame}>重新开始</button>
        )}
      </div>
    </div>
  );
};

export default Snake;