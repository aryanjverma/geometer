# AI-Enhanced Learning Strategies

## Owners

- Aryan Verma
- Cursor

## Purpose

This brainlift is meant to detail how AI-enhanced learning strategies can be used with well-researched learning science principles to create AI integrations that make it easy to learn and retain new concepts.

### In Scope

- Developing AI-powered learning integrations into my app that make learning easy.
- Using learning science to create powerful features in my learning app that promote retention, increase engagement, and allow people to learn more in less time.

### Out of Scope

- Building, training, or researching the underlying AI/LLM models themselves. This brainlift consumes existing foundation models as a tool; it is not about advancing core machine learning architectures.

- Replacing human teachers, tutors, or formal schooling entirely. The focus is on augmenting and accelerating self-directed learning, not eliminating the human elements of education.

- Learning domains outside of foundational mathematics. While the principles generalize, the concrete application here is geometry and adjacent math concepts, not language learning, soft skills, or unrelated subjects.

## DOK 4: Spiky Points of View (SPOVs)

- **Spiky POV 1:** AI tutors will replace human tutors.
  - *Elaboration:* AI is obviously very limited right now, considering how much it needs to do correctly in order to ensure learning (giving the right hints, being paired with other engagement mechanisms, and being checked against ground-truth metrics), but AI has capabilities that humans will simply never have. AI can process data at incredible speeds and use that data to power learning. For example, chat history can be used to adapt to different users' learning speeds instantly, which is a capability that human tutors won't be able to match. AI can tap into all the learning science mechanisms like spaced repetition, adaptive learning, micro-learning modules, and interleaving at a precision and accuracy that humans can't. Additionally, its speed will let it instantly create new questions, design new interactive learning material, and give feedback on assignments. Humans can't beat the speed and memory of AI, but as of right now, AI can't fully tap into that advantage due to the limitations of its current implementations. Within the next 10 years, I think AI tutors will become far more prevalent and, for many learners, will replace the human tutor entirely.
- **Spiky POV 2:** Independent learning is a terrible idea.
  - *Elaboration:* Students without direction have no direction (antanaclasis). Students need some sort of instructor to tell them what to do and guide them along the journey, even if an independent learning system does the actual teaching. They need a framework to understand where to go; otherwise they may be overwhelmed by the options and not know which one to pick. Sure, the journey should be different for different people, but that doesn't mean we shouldn't give students a tour guide. Students need a specific path, otherwise they may not attain all the necessary information they need to move on to the next level. This is why there needs to be a person, or maybe even an AI agent, that decides for them based on their learning status.



## Experts

This section is a curated list of the leading thinkers, researchers, and practitioners in your domain. Following their work is essential for building the foundational knowledge needed for your BrainLift.

### Expert 1

- **Who:** Andrew Ng
- **Focus:** Machine learning and the democratization of education at scale. Co-founder of Coursera and founder of DeepLearning.AI, Ng pioneered the modern MOOC and is a leading voice on using AI as an augmentation tool that lowers the barrier to learning rather than replacing human effort.
- **Why Follow:** His work proves that high-quality instruction can be delivered to millions through software, and his framing of AI as "a tool to amplify human capability" directly informs this BrainLift's purpose of building AI integrations that make learning easier without removing the cognitive work that produces real understanding.
- **Where:** [deeplearning.ai](https://www.deeplearning.ai/), [X (@AndrewYNg)](https://x.com/AndrewYNg), [Google Scholar](https://scholar.google.com/citations?user=mG4imMEAAAAJ)

### Expert 2

- **Who:** Sal Khan
- **Focus:** Mastery-based learning and applied AI tutoring at scale. Founder of Khan Academy and creator of Khanmigo, an AI tutor explicitly designed to ask guiding questions and withhold direct answers. A prominent advocate of solving Bloom's "2 sigma problem" (the gap between classroom and one-on-one tutoring) with technology.
- **Why Follow:** Khanmigo is the clearest real-world implementation of a Socratic AI tutor that refuses to hand over answers, which is direct evidence for the DOK 3 insight that AI must guide rather than tell in order to preserve durable learning. His mastery-learning model also grounds the case for adaptive, periodically-assessed learning paths.
- **Where:** [Khan Academy](https://www.khanacademy.org/), book *Brave New Words* (2024), [X (@salkhanacademy)](https://x.com/salkhanacademy)

### Expert 3

- **Who:** Barbara Oakley
- **Focus:** The neuroscience and practice of learning. Creator of "Learning How to Learn," one of the most popular online courses ever, and author of works on chunking, focused vs. diffuse thinking, and spaced repetition as concrete, teachable study techniques.
- **Why Follow:** Her popularization of spaced repetition and chunking provides the cognitive-science foundation for the spaced-repetition and microlearning branches of the Knowledge Tree, translating dense research into the practical mechanics this app needs to implement.
- **Where:** [barbaraoakley.com](https://barbaraoakley.com/), [Learning How to Learn (Coursera)](https://www.coursera.org/learn/learning-how-to-learn), [X (@barbaraoakley)](https://x.com/barbaraoakley)

### Expert 4

- **Who:** Robert Bjork
- **Focus:** Memory and the science of "desirable difficulties." Director of the UCLA Bjork Learning and Forgetting Lab, known for the critical distinction between *learning* and *performance* and for showing that effortful retrieval and spacing strengthen long-term retention even when they feel harder in the moment.
- **Why Follow:** His finding that current performance is a poor proxy for actual learning is the research backbone of the DOK 3 insight that learning must be measured by transfer to novel problems, and his "desirable difficulties" work justifies why an AI tutor should preserve struggle instead of smoothing it away.
- **Where:** [Bjork Learning and Forgetting Lab](https://bjorklab.psych.ucla.edu/), [Google Scholar](https://scholar.google.com/citations?user=0FFkfHcAAAAJ)



## DOK 3: Insights

- **Insight 1:** People can learn more in less time using strategies that optimize how their psychology works. For example, adaptive learning dynamically modifies lessons to be in-line with how different students are performing and how they learn; spaced repetition promotes learning retention by reintroducing concepts periodically; micro-learning minimizes the costs of working memory overflow by not overworking the brain and splitting topics into manageable micro-lessons.
- **Insight 2:** AI can be a very effective teacher only if it is done correctly. Truth checkers are necessary to keep the AI grounded, unchecked AI's can generate problems that don't match users, AI needs to withhold answers to improve learning, and AI's must ensure users engage actively rather than passively listen to it; oftentimes, they need other engagement mechanisms to be effective. If these factors are controlled, AI can match or beat human tutors in creating unique practice questions, giving good hints that guide users to insight, and providing useful feedback. AI can remove the effort and cognitive dissonance necessary to learning, which is why it must be used correctly to ensure that students are challenged sufficiently rather than being hand-held.
- **Insight 3:** Learning is not signaled by engagement, nor by performance; the best way to evaluate learning is knowledge application to complex problems that differ from the practice's precise wording/presentation. Students can memorize the definition of a word, but if they can't properly use it in a sentence, they don't learn the word. To verify somebody truly understands a concept, it is necessary to test them in ways that make them think outside of the box and use multiple concepts to solve the same problem.



## DOK 2: Knowledge Tree

The Knowledge Tree is the structured foundation of your entire BrainLift (Depth of Knowledge Level 2). It is a hierarchical system where you organize the information you gather from your expert sources. This is where you break down your domain into its core components and document the facts and summaries that will fuel your higher-level thinking.

**How it's Structured and Supports the BrainLift:**

The Knowledge Tree is organized from broad categories to specific facts. It directly supports the creation of Insights (DOK 3) by providing the organized, summarized information your brain needs to make new connections. Without a well-structured Knowledge Tree, it is nearly impossible to build robust, evidence-based insights and SPOVs.

### Category 1: Cognitive Optimization in Educational Technology



#### Subcategory 1.1: Spaced Repetition Systems

**Source 1: The Effect of Spaced Repetition on Learning and Knowledge Transfer (2024)**

*DOK 1 - Facts:*

- A randomized controlled trial of 26,432 participants demonstrated that spaced repetition yielded a long-term knowledge retention rate of 58.03%.
- The traditional modular learning control group achieved a lower long-term knowledge retention rate of 43.20%.
- The study measured a statistically significant increase in the transfer of learned knowledge to entirely novel clinical scenarios.

*DOK 2 - Summary:*

- Spaced repetition results in better retention than traditional modular learning.

[Link to source](https://pubmed.ncbi.nlm.nih.gov/39250798/)

**Source 2: The Effectiveness of Spaced Repetition in Medical Education: A Meta-Analysis (2026)**

*DOK 1 - Facts:*

- This systematic meta-analysis aggregated data from 21,500 active learners across digital platforms.
- The traditional modular learning control group achieved a lower long-term knowledge retention rate of 43.20%.
- The calculated effect size showed a massive positive statistical divergence in retention compared to self-directed reading.

*DOK 2 - Summary:*

- Data from tens of thousands of students shows how effective spaced repetition is.

[Link to source](https://www.researchgate.net/publication/394819697_Microlearning_in_Mathematics_Education_Impacts_on_Student_Retention_and_Cognitive_Load)

#### Subcategory 1.2: Microlearning & Cognitive Load Architecture

**Source 1: Microlearning in Mathematics Education: Impacts on Student Retention and Cognitive Load (2025)**

*DOK 1 - Facts:*

- Segmenting complex STEM topics into 5-to-15 minute micro-modules resulted in an average 30% increase in course retention rates.
- Subjective and objective testing metrics indicated a measurable decrease in "extraneous cognitive load" when content was truncated and focused.

*DOK 2 - Summary:*

- By breaking down complex concepts into small, digestible modules, students are able to learn more due to less cognitive strain and more cognitive working memory per lesson.

[Link to source](https://www.researchgate.net/publication/394819697_Microlearning_in_Mathematics_Education_Impacts_on_Student_Retention_and_Cognitive_Load)

### Category 2: Behavioral Dynamics & Personalization



#### Subcategory 2.1: Gamification Mechanics

**Source 1: Exploring the impact of gamification on students' academic performance: A meta-analysis (2024)**

*DOK 1 - Facts:*

- A random-effects model analyzing 22 experimental studies identified a moderately positive overall effect size of Hedges's g = 0.782 on academic performance.
- The data showed that over-reliance on purely extrinsic rewards (e.g., public leaderboards, badges) caused a drop in long-term intrinsic motivation once rewards ceased.

*DOK 2 - Summary:*

- Gamification can lead to more engagement initially but can leave users bored when the external awards stopped, indicating weak intrinsic motivations.

[Link to source](https://bera-journals.onlinelibrary.wiley.com/doi/10.1111/bjet.13471)

#### Subcategory 2.2: Adaptive Learning Paths

**Source 1: Personalizing Learning Paths: A Study of Adaptive Learning Algorithms and Their Effects on Student Outcomes (2024)**

*DOK 1 - Facts:*

- Dynamically adjusting lesson sequencing using pre-knowledge baseline testing yields a medium-to-large positive effect size on student cognitive outcomes.
- Students using adaptive pathways exhibited a statistically significant upward shift in final exam scores compared to static-curriculum control groups.

*DOK 2 - Summary:*

- Adaptive learning leads to better results, which is why evaluating course mastery periodically is important to determine how to adapt the experience.

[Link to source](https://www.researchgate.net/publication/386544201_Personalizing_Learning_Paths_A_Study_of_Adaptive_Learning_Algorithms_and_Their_Effects_on_Student_Outcomes)

### Category 3: AI-Augmented Learning



#### Subcategory 3.1: Intelligent Tutoring Systems (Baseline Effectiveness)

**Source 1: Do Intelligent Tutoring Systems Benefit K-12 Students? A Meta-Analysis and Evaluation of Heterogeneity of Treatment Effects in the U.S. (2024)**

*DOK 1 - Facts:*

- A meta-analysis of 18 experimental studies (77 effect sizes across 11 different systems) found a statistically significant positive effect of intelligent tutoring systems on K-12 learning outcomes (g = 0.271, SE = 0.011, p = 0.001).
- A MetaForest analysis identified providing worked-out examples and immediate measurement of outcomes as among the most important moderators of how large the treatment effect was.
- Effect sizes were similar for low-achieving students but were lower in studies that included rural schools.

*DOK 2 - Summary:*

- AI tutoring systems reliably improve learning, and the design choice that matters most is grounding them in worked examples and immediate feedback rather than raw answers.

[Link to source](https://arxiv.org/pdf/2511.04997)

**Source 2: Effects of Intelligent Tutoring Systems on Educational Outcomes: Evidence from a Comprehensive Analysis (2025)**

*DOK 1 - Facts:*

- A meta-analysis of 30 studies (k = 30) across multiple countries and education levels found a large overall effect size of g = 0.86 on educational outcomes.
- The strongest gains were in learning attitudes and test scores, while effects on knowledge acquisition and problem-solving skills were less conclusive.
- Game-integrated tutoring systems and systems built around worked examples produced the most positive impact on outcomes.

*DOK 2 - Summary:*

- The biggest measured wins from AI tutors come from pairing them with engagement mechanics and worked examples, not from the AI alone.

[Link to source](https://eric.ed.gov/?id=EJ1462151)

#### Subcategory 3.2: AI Hints and Socratic Guidance

**Source 1: ChatGPT-Generated Help Produces Learning Gains Equivalent to Human Tutor-Authored Help on Mathematics Skills (2024)**

*DOK 1 - Facts:*

- In a randomized study (N = 274) across four math subject areas, the ChatGPT-hint condition was the only one to produce statistically significant learning gains versus a no-help control, with no significant difference in gains or time-on-task versus human tutor-authored hints.
- The raw AI-generated help failed quality checks on 32% of problems.
- Applying self-consistency, a hallucination-mitigation technique, reduced that failure rate to nearly 0% for algebra problems and 13% for statistics problems.

*DOK 2 - Summary:*

- AI can match human tutors at writing hints, but only once a verification layer is added to catch the roughly one-in-three hallucinated responses.

[Link to source](https://pmc.ncbi.nlm.nih.gov/articles/PMC11125466/)

**Source 2: Socratic AI in K-12 Science Classrooms: Effects on Critical Thinking, Motivation, and Self-Regulation in a Randomized Controlled Trial (2025)**

*DOK 1 - Facts:*

- In a randomized controlled trial with 90 tenth-grade students, an AI condition that delivered adaptive scaffolding through Socratic dialogue was compared against argument-driven inquiry and a control group.
- The Socratic AI group showed significantly greater gains in scientific argumentation, critical thinking, self-efficacy, and cognitive engagement than both other groups.
- Effects on metacognitive self-regulation were nonsignificant.

*DOK 2 - Summary:*

- AI that asks guiding questions instead of giving answers measurably boosts reasoning and engagement, where answer-giving AI does not.

[Link to source](https://labs.sciety.org/articles/by?article_doi=10.21203%2Frs.3.rs-8118546%2Fv1)

#### Subcategory 3.3: AI Feedback on Wrong Answers (and the Over-Reliance Risk)

**Source 1: LLM-Generated Feedback Supports Learning If Learners Choose to Use It (2025)**

*DOK 1 - Facts:*

- An analysis of over 2,000 lesson completions found that learners who opted into LLM-generated feedback consistently outperformed those who did not, even after adjusting for self-selection with propensity scoring.
- Elaborated feedback that includes an explanation yields larger effects on learning than feedback that only reports correctness or reveals the answer.
- The learning benefit came without a significant increase in lesson completion time.

*DOK 2 - Summary:*

- Explanatory AI feedback on mistakes improves outcomes cheaply, but only when the learner actively chooses to engage with it.

[Link to source](https://arxiv.org/html/2506.17006v1)

**Source 2: How AI Affects Long-Term Learning (2024)**

*DOK 1 - Facts:*

- In a study of roughly 1,000 high-school students, those using basic ChatGPT and a custom AI tutor initially scored 48% and 127% higher respectively than peers using traditional methods.
- On a later closed-book test of the same skills, the scores of students who had used AI plummeted.
- Students using basic ChatGPT engaged in superficial interactions, frequently asking "What is the answer?"; AI custom-designed to refuse direct answers and instead pose probing questions preserved learning.

*DOK 2 - Summary:*

- Answer-giving AI produces fake short-term gains that collapse without it (metacognitive laziness), so AI must withhold answers to build durable skill.

[Link to source](https://www.edutopia.org/video/how-ai-vaporizes-long-term-learning/)

#### Subcategory 3.4: AI-Generated Practice Problems

**Source 1: Generating Customized Math Word Problems with LLMs (EDUMATH) (2025)**

*DOK 1 - Facts:*

- In the first study of custom LLM-generated math word problems with grade-school students, learners performed similarly on AI-generated problems as on human-written ones.
- Students preferred the LLM-generated, interest-customized problems over the human-written problems.
- Evaluation used a joint human-expert and LLM-judge approach on criteria including solvability, accuracy, and educational appropriateness.

*DOK 2 - Summary:*

- AI can keep a course from running dry by generating unlimited on-standard practice that students actually prefer, provided each item is verified for accuracy.

[Link to source](https://arxiv.org/pdf/2510.06965)

**Source 2: Validating LLM-Generated Assessment Items for Mathematics and Science (TIMSS Grade 4) (2025)**

*DOK 1 - Facts:*

- When LLM-generated items were mixed with real TIMSS items, many AI items were high quality but experts rated them as less suitable and less attractive than the originals.
- The most common psychometric problems were difficulty not aligned to the target group, low or negative discrimination, and repetitive, near-duplicate items.
- AI multiple-choice math items were frequently too easy, and 82% of real TIMSS items hit a good difficulty level versus far fewer of the generated items.

*DOK 2 - Summary:*

- Left unchecked, AI tends to generate problems at the wrong difficulty and to repeat itself, so difficulty calibration and de-duplication are required for generated practice.

[Link to source](https://www.iea.nl/sites/default/files/2025-10/Muszy%C5%84ski%20AIG%20LLM%20Report.pdf)

## Product Decisions: Shipped vs. Considered and Rejected

The research above points toward AI that *augments* deterministic instruction without ever owning the math. That principle is the line every feature decision was measured against: the numbers and the correct answer must come from deterministic, verifiable code, and AI may only add narrative or directional guidance that is checked against those known numbers before it reaches the learner. The table below names what was shipped, what was deliberately rejected, and why.

### Shipped

| Feature | Decision | Why |
| --- | --- | --- |
| AI word-problem reskin | Shipped | AI rewrites a deterministic `GeneratedQuestion` into an interest-themed word problem, but never invents math. A number-preservation validator (`validateReskin`) confirms every given parameter appears as a standalone integer and the answer does not appear at all; any failure falls back to the plain template. Engagement gain with zero risk of a wrong or leaked answer. |
| Socratic hints | Shipped | Hints give a directional nudge toward the method, never the result. A hint validator (`validateHint`) — the same primitive extended — rejects any hint that states the answer, introduces a number outside the givens (a computed intermediate), or includes an explicit formula/equation; it retries once, then falls back to a hand-written hint. Supports productive struggle instead of answer-giving. |
| Mastery-driven lesson selection | Shipped | A rule-based mastery layer (spaced-repetition-style) decides which concepts surface for review. Determinism keeps the learning path explainable and reproducible; AI never decides what to teach, only how to phrase it. |
| Explicit AI off-switch | Shipped | An Account-page toggle (persisted to the profile) disables all reskin and hint AI calls. It makes the no-AI gate verifiable in-app — plain templates and hand-written hints, with no network call attempted — rather than only observable by forcing a failure. |

### Considered and Rejected

| Feature | Decision | Why rejected |
| --- | --- | --- |
| Open chatbot / free-form tutor | Rejected | An unconstrained chat surface invites off-task conversation, prompt injection, and answer-extraction, and there is no reliable way to verify each turn against ground truth. The single-round, validated "Ask Geometer" hint captures the tutoring value while staying inside a checkable boundary. |
| LLM-as-grader | Rejected | Grading must be correct and reproducible. Deterministic solvers already produce the ground-truth answer, so handing correctness to a model would add latency, cost, and a class of silent mis-grades for zero benefit. AI never touches correctness. |
| Free-form AI problem generation | Rejected | Models drift on difficulty, repeat near-duplicates, and can generate unsolvable or subtly wrong items (the TIMSS finding above). Parameterized formats with deterministic solvers guarantee on-standard, calibrated, verifiably correct questions; AI only reskins the prose around them. |