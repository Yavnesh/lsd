import prisma from "@/lib/prisma";

export interface ProgressionResult {
    xpGained: number;
    newIdentityTitle?: string;
    newArtifacts: string[];
    unlockedTopics: string[];
}

export class UniverseEngine {
    
    /**
     * Processes post-game progression:
     * 1. Updates XP and Exploration Score.
     * 2. Checks if Identity Title should level up.
     * 3. Unlocks adjacent 'Fog of War' topics based on Region completion.
     * 4. Awards Artifacts if Regional/World mastery is achieved.
     */
    static async processTopicCompletion(userId: string, topicId: string, earnedXp: number): Promise<ProgressionResult> {
        let newTitle: string | undefined = undefined;
        const newArtifacts: string[] = [];
        const unlockedTopics: string[] = [];
        
        await prisma.$transaction(async (tx) => {
            // 1. Fetch current stats
            const stats = await tx.userStat.findUnique({ where: { userId } });
            if (!stats) return;

            // Simple Identity Leveling Logic
            // In a full production system, this would be a config file mapping rules.
            const newTotalXp = stats.xp + earnedXp;
            const newExploration = stats.explorationScore + 10;
            
            const currentTitle = stats.identityTitle;
            let upgradedTitle = currentTitle;

            if (newExploration >= 50 && currentTitle === "Curious Human") upgradedTitle = "Explorer";
            else if (newExploration >= 150 && currentTitle === "Explorer") upgradedTitle = "Researcher";
            else if (newTotalXp >= 1000 && currentTitle === "Researcher") upgradedTitle = "Scholar";
            
            if (upgradedTitle !== currentTitle) {
                newTitle = upgradedTitle;
            }

            // Update user stats
            await tx.userStat.update({
                where: { userId },
                data: {
                    xp: newTotalXp,
                    explorationScore: newExploration,
                    identityTitle: upgradedTitle
                }
            });

            // 2. Discover / Remove Fog of War
            // Find topics in the same region that are hidden and reveal one.
            const currentTopic = await tx.topic.findUnique({ where: { id: topicId } });
            if (currentTopic && currentTopic.cluster) {
                const hiddenTopics = await tx.topic.findMany({
                    where: {
                        cluster: currentTopic.cluster,
                        isHidden: true
                    },
                    take: 1
                });

                if (hiddenTopics.length > 0) {
                    await tx.topic.update({
                        where: { id: hiddenTopics[0].id },
                        data: { isHidden: false }
                    });
                    unlockedTopics.push(hiddenTopics[0].title);
                }
            }

            // 3. Artifact Logic (Placeholder for Mastery)
            // If Exploration score crosses 100, give a basic artifact as demo
            if (newExploration === 100) {
                const artifact = await tx.knowledgeArtifact.findFirst({ where: { rarity: "COMMON" } });
                if (artifact) {
                    const existing = await tx.userArtifact.findUnique({
                        where: { userId_artifactId: { userId, artifactId: artifact.id } }
                    });
                    if (!existing) {
                        await tx.userArtifact.create({
                            data: { userId, artifactId: artifact.id }
                        });
                        newArtifacts.push(artifact.name);
                    }
                }
            }
        });

        return {
            xpGained: earnedXp,
            newIdentityTitle: newTitle,
            newArtifacts,
            unlockedTopics
        };
    }
}
