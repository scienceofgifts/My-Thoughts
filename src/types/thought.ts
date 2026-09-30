export type ThoughtStatus = 'unsorted' | 'in_progress' | 'resolved';

export interface Thought {
  id: string;
  title: string;
  rawThought: string;
  status: ThoughtStatus;
  topic?: string;
  createdAt: number;
  updatedAt: number;
  
  // Unpacking layers
  botheringMe?: string;
  whatMightBeTrue?: string;
  whatMightNotBeTrue?: string;
  whatICanControl?: string;
  whatICanDo?: string;
  nextAction?: string;
  
  // Related thoughts
  relatedThoughtIds: string[];
  
  // Resolution
  resolution?: string;
  
  pinned?: boolean;
}

export type ThoughtLayerKey = 
  | 'rawThought'
  | 'botheringMe'
  | 'whatMightBeTrue'
  | 'whatMightNotBeTrue'
  | 'whatICanControl'
  | 'whatICanDo'
  | 'nextAction'
  | 'resolution';

export interface LayerDefinition {
  key: ThoughtLayerKey;
  stepNumber: string;
  title: string;
  prompt: string;
  description: string;
  placeholder: string;
  iconName: 'spark' | 'inquiry' | 'true' | 'untrue' | 'compass' | 'action' | 'next' | 'resolve';
}

export type TopicFilter = 'all' | string;
export type StatusFilter = 'all' | ThoughtStatus;

export interface AppSettings {
  fontSize: 'standard' | 'large' | 'compact';
  ambientSound: boolean;
  quietFocusMode: boolean;
  editorialQuotes: boolean;
}
