import React from 'react';
import './Stepper.css';

interface StepperProps {
  currentStep: 1 | 2;
  labels?: [string, string];
}

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  labels = ['Información de cuenta', 'Completar cuenta'],
}) => {
  return (
    <div className="stepper" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={2}>
      {labels.map((label, index) => {
        const stepNumber = (index + 1) as 1 | 2;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div key={stepNumber} className="stepper__step">
            <div
              className={`stepper__bar ${
                isActive ? 'stepper__bar--active' : ''
              } ${isCompleted ? 'stepper__bar--completed' : ''}`}
            />
            <span
              className={`stepper__label ${
                isActive ? 'stepper__label--active' : ''
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};