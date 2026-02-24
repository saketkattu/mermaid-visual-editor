# Mermaid.js Visual Editor — Opportunity One-Pager  
*(Problem Space Only)*

---

## 1. The Core Problem Statement

Users attempting to create diagram-as-code visualizations face escalating friction as diagram complexity increases, where manual syntax authoring becomes cognitively taxing, error-prone, and difficult to iterate on visually. The core tension lies between human visual thinking and text-based diagram construction.

---

## 2. Target User Segments

### **Primary Segment: The PKMS Power User**

These users rely on plain-text workflows inside tools like **Obsidian** to maintain portable, future-proof knowledge systems. Diagrams are not decorative; they are structural thinking tools used to map relationships, systems, and mental models. Plain-text diagrams align with their philosophy of longevity, version control, and interoperability.

**Goals & Motivations:**

- Preserve knowledge in durable, non-proprietary formats  
- Maintain seamless integration with markdown-based systems  
- Rapidly iterate on conceptual models  

**Current Reality:**

They tolerate syntax complexity until diagrams exceed a manageable threshold, at which point editing becomes disproportionately effortful.

---

### **Secondary Segment: The Technical Writer / Educator**

These users use Mermaid to communicate processes, flows, and systems in documentation. Their priority is clarity and iteration speed rather than syntactic mastery.

**Goals & Motivations:**

- Quickly express conceptual diagrams  
- Maintain diagrams close to documentation source  
- Avoid visual drift between diagrams and text  

**Current Reality:**

Syntax introduces friction that competes with their primary job: explaining ideas.

---

### **Secondary Segment: The System Architect / Developer**

These users value diagrams as structured artifacts that integrate with codebases, design systems, and documentation pipelines.

**Goals & Motivations:**

- Version-controlled diagrams  
- Reproducible visual representations  
- Low overhead iteration  

**Current Reality:**

They experience diminishing returns when diagrams become visually complex but syntactically dense.

---

## 3. Jobs-to-be-Done (JTBD)

- **When I am modeling complex systems or ideas**, I want to express relationships visually without fighting syntax, **so I can focus on thinking rather than formatting.**

- **When I refine or update diagrams**, I want changes to feel lightweight and intuitive, **so I can iterate rapidly without cognitive fatigue.**

- **When I store diagrams inside my knowledge or documentation workflows**, I want them to remain portable and future-proof, **so I avoid lock-in or fragmentation.**

---

## 4. The Friction Matrix (Current Reality)

### **Manual Syntax Authoring**

**Strength:** Maximum portability and precision.

**Breaking Point:**  
As diagrams scale, users encounter:

- Syntax fatigue  
- High error frequency  
- Poor editability  
- Cognitive overload  

Users shift from designing systems to debugging text.

---

### **Mermaid Live Editor**

**Strength:** Official, free, syntax-complete.

**Breaking Point:**  

- Requires disruptive context switching  
- No persistent bi-directional workflow with local files  
- Copy-paste overhead  

Iteration becomes fragmented across tools.

---

### **Excalidraw / Visual Whiteboarding**

**Strength:** Highly intuitive visual manipulation.

**Breaking Point:**  

- Loss of diagram-as-code benefits  
- Weak portability  
- One-way or unreliable conversions  

Users sacrifice structured representation for visual ease.

---

### **AI-Assisted Generation**

**Strength:** Fast initial diagram creation.

**Breaking Point:**  

- Syntax errors  
- Hallucinations  
- Manual cleanup burden  

Users trade typing friction for validation friction.

---

## 5. Market Sizing & Opportunity

Mermaid.js exhibits substantial ecosystem penetration:

- **86,300+ GitHub Stars**  
- **~2.8M Weekly NPM Downloads**  
- **~350,000+ Mermaid-related Plugin Downloads (Obsidian ecosystem)**  

Applying conservative assumptions:

- Estimated global MAU proxy: **10M–15M users**  
- Estimated friction-affected users (~20%): **~2.5M–3M users**  

This represents a large, structurally embedded user base experiencing recurring productivity friction rather than a niche or speculative problem.

**Why Now?**

- Diagram-as-code adoption is accelerating  
- Knowledge management workflows are increasingly local-first  
- Users actively seek workarounds, signaling unresolved pain  

---

## 6. Key Risks in the Problem Space

### **The Layout Expectation Paradox**

Users think spatially, but Mermaid operates via automated layout logic. There is a fundamental mismatch between:

- Human mental models (visual positioning)  
- System mental models (rule-based graph rendering)  

Understanding user expectations around control vs. automation is critical.

---

### **Tolerance vs. Frustration Threshold**

Power users often develop coping mechanisms. The challenge lies in identifying:

- When friction becomes abandonment  
- Which pains are tolerated vs. intolerable  

Not all friction translates into switching behavior.

---

### **Syntax as Both Feature and Barrier**

Syntax provides portability, reproducibility, and precision. However, it simultaneously introduces:

- Cognitive overhead  
- Editing fatigue  
- Accessibility barriers  

The dual role of syntax must be deeply understood.

---

## 7. Supporting Data & User Findings

### **Qualitative Signals**

Users consistently express:

- **Syntax fatigue** as diagrams scale  
- **Layout frustration** from unpredictable rendering  
- **Desire for visual intuition** without abandoning plain-text workflows  

Representative sentiments:

- “Creating and editing diagrams visually is much more intuitive.”  
- “Syntax gets cumbersome real fast for larger mind maps.”  
- “Mermaid chooses poor layouts… lines are inconsistent.”  
- “Been waiting for something like this since forever.”  

---

### **Quantitative Signals**

**Ecosystem Engagement:**

- GitHub Reactions on GUI-related threads: **~42+**  
- Unique Comments: **~65+**  
- Vocal Users Discussing Pain: **~100+**  

**Silent Friction Projection (90-9-1 Rule):**

- Vocal Users (~1%): ~100  
- Engaged Observers (~9%): ~900  
- Silent Friction Users (~90%): ~9,000+  

**Market Estimates:**

- Immediate Addressable Market (Active Seekers): **~250,000 users**  
- Total Addressable Market (Friction-Affected Users): **~2.5M–3M users**  

---

### **Observed Behavioral Patterns**

Users currently cope via:

- Accepting syntax burden  
- Switching to visual tools (loss of portability)  
- Using AI (validation overhead)  
- Avoiding complex diagrams entirely  

This indicates productivity friction rather than lack of demand.

---

**Conclusion (Problem Framing):**  
A large, technically sophisticated user base experiences persistent friction at the intersection of visual cognition and text-based diagram construction. The pain intensifies with diagram complexity, directly impacting iteration speed, mental load, and workflow continuity.
