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
    if (gameOver || isPaused) return;
    
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
    
    // 将新头部添加到蛇身
    newSnake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
      // 吃到食物，生成新食物，增加分数
      setFood(generateFood());
      setScore(prevScore => prevScore + 10);
      
      // 每得100分增加速度
      if (score > 0 && score % 100 === 0) {
        setSpeed(prevSpeed => Math.max(prevSpeed - 10, 50));
      }
    } else {
      // 没吃到食物，移除尾部
      newSnake.pop();
    }
    
    setSnake(newSnake);
  };
  
  // 处理键盘输入
  const handleKeyDown = (e) => {
    // 防止方向键滚动页面
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    
    // 暂停/继续游戏
    if (e.key === ' ') {
      setIsPaused(prev => !prev);
      return;
    }
    
    // 如果游戏结束，按任意键重新开始
    if (gameOver) {
      resetGame();
      return;
    }
    
    // 更新方向（防止180度转向）
    switch (e.key) {
      case 'ArrowUp':
        if (direction !== 'DOWN') setDirection('UP');
        break;
      case 'ArrowDown':
        if (direction !== 'UP') setDirection('DOWN');
        break;
      case 'ArrowLeft':
        if (direction !== 'RIGHT') setDirection('LEFT');
        break;
      case 'ArrowRight':
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
  
  // 游戏循环
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    gameLoopRef.current = setInterval(moveSnake, speed);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(gameLoopRef.current);
    };
  }, [snake, direction, food, gameOver, speed, isPaused]);
  
  // 当速度改变时更新游戏循环
  useEffect(() => {
    clearInterval(gameLoopRef.current);
    gameLoopRef.current = setInterval(moveSnake, speed);
    
    return () => clearInterval(gameLoopRef.current);
  }, [speed]);
  
  // 渲染游戏
  return (
    <div className={styles.gameContainer}>
      <div className={styles.scoreBoard}>
        <span>分数: {score}</span>
        {isPaused && <span className={styles.pausedText}>已暂停</span>}
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
            key={`snake-${index}`}
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
        
        {/* 游戏结束提示 */}
        {gameOver && (
          <div className={styles.gameOverOverlay}>
            <h2>游戏结束!</h2>
            <p>你的得分: {score}</p>
            <button onClick={resetGame}>再玩一次</button>
          </div>
        )}
      </div>
      
      <div className={styles.controls}>
        <p>使用方向键控制蛇的移动</p>
        <p>空格键暂停/继续游戏</p>
        {gameOver && <p>按任意键重新开始</p>}
      </div>
    </div>
  );
};

export default Snake;