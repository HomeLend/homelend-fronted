import React from 'react';
import './style.css';

const LoadingIndicator = () => (
  <div className={"spinner text-center mt-2"}>
    <div className={"bounce1"}/>
    <div className={"bounce2"}/>
    <div className={"bounce3"}/>
  </div>
)

export default LoadingIndicator;
