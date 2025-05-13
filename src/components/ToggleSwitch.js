import React, { useState } from "react";
import "./ToggleSwitch.css"; // 스타일 분리 (아래 참고)

function ToggleSwitch() {
  const [isOn, setIsOn] = useState(false);

  const toggleHandler = () => {
    setIsOn(prev => !prev);
    console.log("Toggle 상태:", !isOn ? "ON" : "OFF");
  };

  return (
    <label className="switch">
      <input type="checkbox" checked={isOn} onChange={toggleHandler} />
      <span className="slider" />
    </label>
  );
}

export default ToggleSwitch;
