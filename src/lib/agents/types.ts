import { z } from "zod";

// Question Type Enum Zod Schema
export const QuestionTypeSchema = z.enum([
  "MULTIPLE_CHOICE",
  "SCENARIO_DECISION",
  "MYTH_FACT",
  "FILL_CONCEPT",
  "ORDER_STEPS"
]);

// Single Question Schema
export const QuestionSchema = z.object({
  type: QuestionTypeSchema,
  text: z.string().min(10).max(500),
  options: z.array(z.string()).min(2).max(6),
  correctIndex: z.number().int().min(0).max(5),
  explanation: z.string().min(10).max(500),
});

// Slides for Mission brief
export const MissionBriefSchema = z.object({
  hook: z.string().max(200),
  context: z.string().max(400),
  learningObjectives: z.array(z.string()).min(1),
});

// Full Mission Schema
export const MissionSchema = z.object({
  name: z.string().min(3).max(100),
  slug: z.string().min(3),
  sequenceOrder: z.number().int().min(1).max(20),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  brief: MissionBriefSchema,
  questions: z.array(QuestionSchema).min(1).max(10),
});

// TypeScript interfaces
export type QuestionTypeData = z.infer<typeof QuestionTypeSchema>;
export type QuestionData = z.infer<typeof QuestionSchema>;
export type MissionData = z.infer<typeof MissionSchema>;

export interface PlannerOutput {
  worldName: string;
  regionName: string;
  missionName: string;
  sequenceOrder: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  focusConcept: string;
}

export interface ResearchOutput extends PlannerOutput {
  factsheetMarkdown: string;
}
