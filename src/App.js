import React, { useState } from "react";

function App() {
  // 화면 단계: 시작, 질문, 결과
  const [screen, setScreen] = useState("start");

  // 현재 질문 순서와 사용자의 답변 상태
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  // 현재 추천 결과와 추천 이유
  const [selectedFood, setSelectedFood] = useState(null);
  const [reason, setReason] = useState("");

  const foods = [
    { name: "국밥", tags: ["든든", "따뜻", "한식", "담백"] },
    { name: "냉면", tags: ["가벼움", "시원", "한식"] },
    { name: "돈까스", tags: ["든든", "양식", "밀가루", "느끼"] },
    { name: "샐러드", tags: ["가벼움", "건강", "양식", "담백"] },
    { name: "마라탕", tags: ["매운", "든든", "자극적"] },
    { name: "파스타", tags: ["양식", "느끼", "밀가루"] },
  ];

  const questions = [
    {
      key: "hunger",
      title: "배고픔 정도는 어떤가요?",
      options: ["가볍게", "든든하게"],
    },
    {
      key: "temperature",
      title: "어떤 온도의 음식이 좋나요?",
      options: ["따뜻한", "시원한"],
    },
    {
      key: "taste",
      title: "오늘은 어떤 맛이 끌리나요?",
      options: ["자극적", "담백"],
    },
    {
      key: "category",
      title: "음식 종류는 어느 쪽이 좋나요?",
      options: ["한식", "양식"],
    },
    {
      key: "health",
      title: "건강도 고려할까요?",
      options: ["건강식", "상관없음"],
    },
    {
      key: "dislike",
      title: "싫은 음식 요소가 있나요?",
      options: ["느끼", "매운", "밀가루", "없음"],
    },
  ];

  // 선택값을 음식 태그와 비교할 수 있는 값으로 변환
  const answerToTagMap = {
    가볍게: "가벼움",
    든든하게: "든든",
    따뜻한: "따뜻",
    시원한: "시원",
    자극적: "자극적",
    담백: "담백",
    한식: "한식",
    양식: "양식",
    건강식: "건강",
  };

  // 사용자 답변을 바탕으로 긍정 조건 태그 목록 생성
  const getPositiveTags = (currentAnswers) => {
    return Object.values(currentAnswers)
      .map((value) => answerToTagMap[value])
      .filter(Boolean);
  };

  // 추천 이유 문장 생성
  const makeReason = (currentAnswers) => {
    const parts = [];

    if (currentAnswers.hunger === "가볍게") parts.push("가볍게 먹고 싶고");
    if (currentAnswers.hunger === "든든하게") parts.push("든든하게 먹고 싶고");
    if (currentAnswers.temperature === "따뜻한") parts.push("따뜻한 음식이 좋고");
    if (currentAnswers.temperature === "시원한") parts.push("시원한 음식이 좋고");
    if (currentAnswers.health === "건강식") parts.push("건강도 고려해서");

    if (parts.length === 0) {
      return "선택한 조건에 잘 맞는 메뉴예요.";
    }

    return `${parts.join(" ")} 추천했어요.`;
  };

  // 점수 계산 후 상위 3개 중 랜덤으로 하나 선택
  const recommendFood = (currentAnswers) => {
    const positiveTags = getPositiveTags(currentAnswers);
    const dislikeTag = currentAnswers.dislike === "없음" ? null : currentAnswers.dislike;

    const rankedFoods = foods
      .map((food) => {
        let score = 0;

        positiveTags.forEach((tag) => {
          if (food.tags.includes(tag)) {
            score += 2;
          }
        });

        if (dislikeTag && food.tags.includes(dislikeTag)) {
          score -= 3;
        }

        return { ...food, score };
      })
      .sort((a, b) => b.score - a.score);

    const topThree = rankedFoods.slice(0, 3);
    const randomFood = topThree[Math.floor(Math.random() * topThree.length)];

    setSelectedFood(randomFood);
    setReason(makeReason(currentAnswers));
    setScreen("result");
  };

  // 답변을 저장하고 마지막 질문이면 결과를 계산
  const handleSelectOption = (option) => {
    const nextAnswers = {
      ...answers,
      [questions[currentQuestionIndex].key]: option,
    };

    setAnswers(nextAnswers);

    if (currentQuestionIndex === questions.length - 1) {
      recommendFood(nextAnswers);
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setScreen("start");
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedFood(null);
    setReason("");
  };

  const handleReroll = () => {
    recommendFood(answers);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={styles.app}>
      <div style={styles.card}>
        {screen === "start" && (
          <>
            <h1 style={styles.title}>결정잘해</h1>
            <p style={styles.description}>몇 가지 질문만 답하면 오늘 먹을 메뉴를 추천해드릴게요.</p>
            <button style={styles.primaryButton} onClick={() => setScreen("question")}>
              결정해줘
            </button>
          </>
        )}

        {screen === "question" && (
          <>
            <p style={styles.progress}>
              {currentQuestionIndex + 1} / {questions.length}
            </p>
            <h2 style={styles.questionTitle}>{currentQuestion.title}</h2>
            <div style={styles.buttonGroup}>
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  style={styles.optionButton}
                  onClick={() => handleSelectOption(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}

        {screen === "result" && selectedFood && (
          <>
            <p style={styles.resultLabel}>추천 메뉴</p>
            <h2 style={styles.resultFood}>{selectedFood.name}</h2>
            <p style={styles.description}>{reason}</p>
            <div style={styles.buttonGroup}>
              <button style={styles.primaryButton} onClick={handleReroll}>
                다시 추천
              </button>
              <button style={styles.secondaryButton} onClick={handleRestart}>
                처음으로
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    backgroundColor: "#f4f4f4",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "32px",
    marginBottom: "12px",
  },
  description: {
    fontSize: "16px",
    lineHeight: 1.5,
    color: "#555555",
    marginBottom: "20px",
  },
  progress: {
    fontSize: "14px",
    color: "#888888",
    marginBottom: "12px",
  },
  questionTitle: {
    fontSize: "24px",
    lineHeight: 1.4,
    marginBottom: "24px",
  },
  resultLabel: {
    fontSize: "14px",
    color: "#888888",
    marginBottom: "8px",
  },
  resultFood: {
    fontSize: "36px",
    marginBottom: "16px",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  primaryButton: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "12px",
    backgroundColor: "#222222",
    color: "#ffffff",
    fontSize: "18px",
    cursor: "pointer",
  },
  secondaryButton: {
    width: "100%",
    padding: "16px",
    border: "1px solid #cccccc",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    color: "#222222",
    fontSize: "18px",
    cursor: "pointer",
  },
  optionButton: {
    width: "100%",
    padding: "16px",
    border: "1px solid #dddddd",
    borderRadius: "12px",
    backgroundColor: "#fafafa",
    color: "#222222",
    fontSize: "18px",
    cursor: "pointer",
  },
};

export default App;
