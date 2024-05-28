import { motion } from "framer-motion";

const loadingContainer = {
  width: "2rem",
  height: "2rem",
  display: "flex",
  justifyContent: "space-around"
};

const loadingCircle = {
  display: "block",
  width: "0.5rem",
  height: "0.5rem",
  backgroundColor: "black",
  borderRadius: "0.25rem"
};

const loadingContainerVariants = {
  start: {
    transition: {
      staggerChildren: 0.1
    }
  },
  end: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const loadingCircleVariants = {
  start: {
    y: "0%"
  },
  end: {
    y: "100%"
  }
};


export const ThreeDotsWave = () => {
  return (
    <motion.div
      style={loadingContainer}
      variants={loadingContainerVariants}
      initial="start"
      animate="end"
    >
      <motion.span
        style={loadingCircle}
        variants={loadingCircleVariants}
        transition={{
        repeat: Infinity, // 애니메이션을 무한 반복하도록 설정
        repeatType: "reverse", // 애니메이션을 반복할 때마다 역방향으로 재생
        duration: 0.4,
        ease: "easeInOut"
      }}
      />
      <motion.span
        style={loadingCircle}
        variants={loadingCircleVariants}
        transition={{
        repeat: Infinity, // 애니메이션을 무한 반복하도록 설정
        repeatType: "reverse", // 애니메이션을 반복할 때마다 역방향으로 재생
        duration: 0.4,
        ease: "easeInOut"
      }}
      />
      <motion.span
        style={loadingCircle}
        variants={loadingCircleVariants}
        transition={{
        repeat: Infinity, // 애니메이션을 무한 반복하도록 설정
        repeatType: "reverse", // 애니메이션을 반복할 때마다 역방향으로 재생
        duration: 0.4,
        ease: "easeInOut"
      }}
      />
    </motion.div>
  );
};
