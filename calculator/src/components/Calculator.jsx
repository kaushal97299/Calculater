import { useState } from 'react';
import '../styles/Calculator.css';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [prevAnswer, setPrevAnswer] = useState(null);
  const [lastInput, setLastInput] = useState('');

  const operations = ['÷', '×', '-', '+'];
  const specialFunctions = ['sin', 'cos', 'tan', 'log', 'sqrt'];

  const isOperation = (char) => operations.includes(char);

  const sanitizeNumber = (num) => {
    // Remove trailing zeros after decimal point
    if (num.includes('.')) {
      return num.replace(/\.?0+$/, '');
    }
    return num;
  };

  const handleNumber = (num) => {
    if (display === 'Error') {
      setDisplay(num);
      setEquation(num);
    } else {
      if (lastInput === '=' && !isOperation(equation.slice(-1))) {
        setDisplay(num);
        setEquation(num);
      } else {
        setDisplay(display === '0' ? num : display + num);
        setEquation(equation + num);
      }
    }
    setLastInput(num);
  };

  const handleOperation = (op) => {
    if (display === 'Error') {
      if (prevAnswer !== null) {
        setDisplay('0');
        setEquation(prevAnswer.toString() + ' ' + op + ' ');
      }
      return;
    }

    const trimmedEquation = equation.trim();
    if (trimmedEquation === '') {
      if (prevAnswer !== null) {
        setEquation(prevAnswer.toString() + ' ' + op + ' ');
      }
      return;
    }

    const lastChar = trimmedEquation.slice(-1);
    if (isOperation(lastChar)) {
      setEquation(trimmedEquation.slice(0, -2) + ' ' + op + ' ');
    } else {
      setEquation(trimmedEquation + ' ' + op + ' ');
    }
    setDisplay('0');
    setLastInput(op);
  };

  const handleSpecialFunction = (func) => {
    if (display === 'Error') {
      setDisplay('0');
      setEquation(func + '(');
    } else {
      if (lastInput === '=' || equation === '') {
        setEquation(func + '(');
      } else {
        const lastChar = equation.slice(-1).trim();
        if (isOperation(lastChar) || lastChar === '(') {
          setEquation(equation + func + '(');
        } else {
          setEquation(equation + ' × ' + func + '(');
        }
      }
      setDisplay('0');
    }
    setLastInput(func);
  };

  const handleDecimal = () => {
    if (display === 'Error') {
      setDisplay('0.');
      setEquation('0.');
      setLastInput('.');
      return;
    }

    const currentNumber = display.split(' ').pop();
    if (!currentNumber.includes('.')) {
      const newDisplay = display === '0' ? '0.' : display + '.';
      setDisplay(newDisplay);
      setEquation(equation + '.');
      setLastInput('.');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setLastInput('');
  };

  const handleDelete = () => {
    if (display === 'Error') {
      setDisplay('0');
      setEquation('');
      setLastInput('');
      return;
    }

    const trimmedEq = equation.trimEnd();
    if (trimmedEq.endsWith(' ')) {
      // Removing an operator
      const newEq = trimmedEq.slice(0, -3);
      setEquation(newEq);
      setDisplay(newEq.split(' ').pop() || '0');
    } else {
      // Removing a number or parenthesis
      const newEq = trimmedEq.slice(0, -1);
      setEquation(newEq);
      const newDisplay = display === '0' ? '0' : display.slice(0, -1);
      setDisplay(newDisplay || '0');
    }
    setLastInput('DEL');
  };

  const calculateResult = () => {
    try {
      if (display === 'Error' || equation === '') {
        return;
      }

      let evalEquation = equation.trim();

      // Check for balanced parentheses
      let openParens = (evalEquation.match(/\(/g) || []).length;
      let closeParens = (evalEquation.match(/\)/g) || []).length;
      
      // Add missing closing parentheses
      while (openParens > closeParens) {
        evalEquation += ')';
        closeParens++;
      }

      // Handle implicit multiplication
      evalEquation = evalEquation
        .replace(/\)\(/g, ')*(')
        .replace(/(\d+)\(/g, '$1*(')
        .replace(/\)(\d+)/g, ')*$1');

      // Convert trigonometric inputs from degrees to radians
      evalEquation = evalEquation
        .replace(/sin\(/g, 'Math.sin((Math.PI/180)*')
        .replace(/cos\(/g, 'Math.cos((Math.PI/180)*')
        .replace(/tan\(/g, 'Math.tan((Math.PI/180)*')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/×/g, '*')
        .replace(/÷/g, '/');

      // Remove trailing operators
      evalEquation = evalEquation.replace(/[+\-*\/\s]+$/, '');

      // Check for division by zero
      const parts = evalEquation.split('/');
      for (let i = 1; i < parts.length; i++) {
        const denominator = eval(parts[i].split(/[+\-*\/]/)[0]);
        if (Math.abs(denominator) < 1e-10) {
          throw new Error('Division by zero');
        }
      }

      // Evaluate and handle special cases
      const result = eval(evalEquation);

      if (isNaN(result) || !isFinite(result)) {
        throw new Error('Invalid calculation');
      }

      // Round to 8 decimal places to avoid floating point issues
      const roundedResult = Math.round(result * 100000000) / 100000000;
      const displayResult = sanitizeNumber(roundedResult.toString());
      
      setDisplay(displayResult);
      setEquation(displayResult);
      setPrevAnswer(roundedResult);
      setLastInput('=');
      return displayResult;

    } catch (error) {
      setDisplay('Error');
      setLastInput('Error');
      return 'Error';
    }
  };

  const handleAns = () => {
    if (prevAnswer === null) return;

    const prevAnswerStr = sanitizeNumber(prevAnswer.toString());

    if (display === 'Error' || lastInput === '=' || equation === '') {
      setDisplay(prevAnswerStr);
      setEquation(prevAnswerStr);
    } else {
      const lastChar = equation.slice(-1).trim();
      if (isOperation(lastChar) || lastChar === '(') {
        setDisplay(prevAnswerStr);
        setEquation(equation + prevAnswerStr);
      } else {
        setDisplay(prevAnswerStr);
        setEquation(equation + ' × ' + prevAnswerStr);
      }
    }
    setLastInput('ANS');
  };

  return (
    <div className="calculator">
      <div className="calculator-display">
        <div className="equation">{equation || '0'}</div>
        <div className="result">{display}</div>
      </div>
      <div className="calculator-buttons">
        <div className="functions">
          {specialFunctions.map((func) => (
            <button key={func} onClick={() => handleSpecialFunction(func)}>
              {func}
            </button>
          ))}
          <button onClick={() => handleNumber('(')}>(</button>
        </div>
        <div className="numbers-and-ops">
          <button className="clear" onClick={handleClear}>AC</button>
          <button onClick={handleDelete}>DEL</button>
          <button onClick={() => handleNumber(')')}>)</button>
          <button onClick={() => handleOperation('÷')}>÷</button>
          
          <button onClick={() => handleNumber('7')}>7</button>
          <button onClick={() => handleNumber('8')}>8</button>
          <button onClick={() => handleNumber('9')}>9</button>
          <button onClick={() => handleOperation('×')}>×</button>
          
          <button onClick={() => handleNumber('4')}>4</button>
          <button onClick={() => handleNumber('5')}>5</button>
          <button onClick={() => handleNumber('6')}>6</button>
          <button onClick={() => handleOperation('-')}>-</button>
          
          <button onClick={() => handleNumber('1')}>1</button>
          <button onClick={() => handleNumber('2')}>2</button>
          <button onClick={() => handleNumber('3')}>3</button>
          <button onClick={() => handleOperation('+')}>+</button>
          
          <button onClick={() => handleNumber('0')}>0</button>
          <button onClick={handleDecimal}>.</button>
          <button onClick={handleAns}>ANS</button>
          <button className="equals" onClick={calculateResult}>=</button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
