console.log("Hash is:", window.location.hash);
function showCorrectAnswer() {
  const resultElement =
  document.getElementById("quizResult");
  resultElement.innerHTML = "✅ Correct! 9.5 g/dL is typically considered LOW.";
resultElement.style.color = "green";
  }
  function showIncorrectAnswer() {
    const resultElement = 
    document.getElementById("quizResult")
    resultElement.innerHTML = "❌ Incorrect. 9.5 g/dL is typically considered LOW.";
    resultElement.style.color = "red";
  }
  

