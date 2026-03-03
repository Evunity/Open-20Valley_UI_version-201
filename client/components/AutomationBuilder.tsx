import React, { useState } from 'react';
import { VisualWorkflowBuilder } from './VisualWorkflowBuilder';

interface AutomationBuilderProps {
  onSave?: (automation: any) => void;
  onCancel?: () => void;
}

export const AutomationBuilder: React.FC<AutomationBuilderProps> = ({ onSave, onCancel }) => {
  return (
    <div className="w-full h-full flex flex-col">
      <VisualWorkflowBuilder
        onSave={(workflow) => {
          onSave?.(workflow);
        }}
        onCancel={onCancel}
      />
    </div>
  );
};
