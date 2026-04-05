// ─── Types ────────────────────────────────────────────────────────────────────

export interface LinkedModule {
  label: string;
  href: string;
  available: boolean;
}

export interface ClauseItem {
  id: string;          // e.g. "4.1", "6.1.2"
  number: string;      // display number
  title: string;
  summary: string;
  purpose: string;     // Why this clause exists
  requirements: string[];
  auditQuestions: string[];
  linkedModules: LinkedModule[];
  keyTerms?: { term: string; definition: string }[];  // only for Clause 3
  children?: ClauseItem[];
}

export interface TopClause {
  number: number;
  id: string;
  title: string;
  overview: string;
  isHLS: boolean;  // Clauses 4–10 follow the Annex L High Level Structure
  children: ClauseItem[];
}

// ─── Standard data ────────────────────────────────────────────────────────────

export const ISO_45001: TopClause[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // CLAUSE 1 — Scope
  // ──────────────────────────────────────────────────────────────────────────
  {
    number: 1,
    id: '1',
    title: 'Scope',
    overview:
      'Defines what the standard covers, who it applies to, and what it is intended to achieve.',
    isHLS: false,
    children: [
      {
        id: '1',
        number: '1',
        title: 'Scope',
        summary:
          'ISO 45001:2018 specifies requirements for an Occupational Health and Safety (OH&S) management system. It provides a framework for organizations to proactively improve OH&S performance, prevent work-related injury and ill health, and provide safe and healthy workplaces. The standard is applicable to any organization regardless of size, type, or the nature of its activities.',
        purpose:
          'To clearly define the boundaries and applicability of the standard, ensuring organizations understand what is and is not covered, and the intended outcomes of implementing the OH&S management system.',
        requirements: [
          'The OH&S MS must help the organization achieve its intended outcomes: continual improvement of OH&S performance, fulfilment of legal requirements, and achievement of OH&S objectives.',
          'The standard applies to the OH&S risks under the organization\'s control or influence.',
          'The standard does not address specific product safety, property damage, or environmental impacts except where they constitute a risk to workers.',
          'All requirements must be applicable regardless of the organization\'s sector, size, or nature of work.',
          'The organization must determine which activities, products, and services are within the scope of the OH&S MS.',
        ],
        auditQuestions: [
          'Has the organization clearly defined the scope of its OH&S management system in documented form?',
          'Does the scope reflect the organization\'s activities, products, and services, and their OH&S impacts?',
          'Can the organization demonstrate how the OH&S MS contributes to the three intended outcomes (performance improvement, legal compliance, objective achievement)?',
        ],
        linkedModules: [],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CLAUSE 2 — Normative References
  // ──────────────────────────────────────────────────────────────────────────
  {
    number: 2,
    id: '2',
    title: 'Normative References',
    overview:
      'States that there are no normative references in this standard. ISO 45001:2018 is fully self-contained.',
    isHLS: false,
    children: [
      {
        id: '2',
        number: '2',
        title: 'Normative References',
        summary:
          'Unlike many ISO standards, ISO 45001:2018 contains no normative references. This means there are no other documents whose provisions are incorporated by reference and are indispensable for the application of this standard. All necessary definitions, requirements, and guidance are contained within the document itself.',
        purpose:
          'To confirm the standard is self-contained and does not depend on external normative documents, simplifying implementation and certification.',
        requirements: [
          'No external normative references are applicable. The standard is self-sufficient.',
          'Organizations implementing ISO 45001 do not need to source or comply with additional referenced standards as a prerequisite.',
          'Other standards (e.g. ISO 9001, ISO 14001) may complement ISO 45001 and support integrated management systems, but are not normatively required.',
        ],
        auditQuestions: [
          'Is the organization aware that no normative references are required for this standard?',
          'If the organization operates an integrated management system, has it confirmed which elements are common HLS requirements versus standard-specific?',
        ],
        linkedModules: [],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CLAUSE 3 — Terms and Definitions
  // ──────────────────────────────────────────────────────────────────────────
  {
    number: 3,
    id: '3',
    title: 'Terms and Definitions',
    overview:
      'Defines the key terms and concepts used throughout the standard. Understanding these definitions is foundational to correct implementation.',
    isHLS: false,
    children: [
      {
        id: '3',
        number: '3',
        title: 'Terms and Definitions',
        summary:
          'ISO 45001:2018 defines 37 terms specific to occupational health and safety management. These terms provide a common language for the standard, ensuring consistent interpretation and implementation across all types of organizations globally.',
        purpose:
          'To establish an unambiguous shared vocabulary for all parties implementing, auditing, or certifying against ISO 45001:2018.',
        requirements: [
          'All persons involved in implementing or auditing the OH&S MS should be familiar with key defined terms.',
          'Definitions in the standard take precedence over colloquial or industry-specific interpretations.',
          'The organization should ensure internal documentation and training materials use terms consistently with the standard\'s definitions.',
        ],
        auditQuestions: [
          'Are key personnel aware of and using the standard\'s defined terms consistently?',
          'Does the organization\'s internal OH&S documentation align with the standard\'s terminology?',
          'Is there evidence that training materials incorporate the standard definitions?',
        ],
        linkedModules: [],
        keyTerms: [
          { term: 'Organization', definition: 'Person or group of people that has its own functions with responsibilities, authorities and relationships to achieve its objectives.' },
          { term: 'Interested party (stakeholder)', definition: 'Person or organization that can affect, be affected by, or perceive itself to be affected by a decision or activity.' },
          { term: 'Worker', definition: 'Person performing work or work-related activities that are under the control of the organization — includes employees, contractors, and volunteers.' },
          { term: 'Participation', definition: 'Involvement in decision-making by workers.' },
          { term: 'Consultation', definition: 'Seeking views before making a decision, including involvement of workers\' representatives where they exist.' },
          { term: 'Workplace', definition: 'Place under the control of the organization where a person needs to be or go by reason of work.' },
          { term: 'Contractor', definition: 'External organization providing services in accordance with agreed specifications, terms and conditions within the organization\'s workplace.' },
          { term: 'Requirement', definition: 'Need or expectation that is stated, generally implied or obligatory.' },
          { term: 'Legal requirements and other requirements', definition: 'Legal requirements an organization must comply with and other requirements it chooses to or must comply with.' },
          { term: 'Management system', definition: 'Set of interrelated or interacting elements of an organization to establish policies, objectives and processes to achieve those objectives.' },
          { term: 'Top management', definition: 'Person or group of people who directs and controls an organization at the highest level.' },
          { term: 'Effectiveness', definition: 'Extent to which planned activities are realized and planned results achieved.' },
          { term: 'Policy', definition: 'Intentions and direction of an organization as formally expressed by its top management.' },
          { term: 'Objective', definition: 'Result to be achieved — in this context, related to OH&S performance.' },
          { term: 'OH&S objective', definition: 'Objective set by the organization to achieve specific results consistent with the OH&S policy.' },
          { term: 'Injury and ill health', definition: 'Adverse effect on the physical, mental or cognitive condition of a person.' },
          { term: 'Hazard', definition: 'Source with a potential to cause injury and ill health.' },
          { term: 'Risk', definition: 'Effect of uncertainty.' },
          { term: 'OH&S risk', definition: 'Combination of the likelihood of occurrence of a work-related hazardous event or exposure and the severity of injury and ill health that can be caused by the event or exposure.' },
          { term: 'OH&S opportunity', definition: 'Circumstance or set of circumstances that can lead to improvement of OH&S performance.' },
          { term: 'Competence', definition: 'Ability to apply knowledge and skills to achieve intended results.' },
          { term: 'Documented information', definition: 'Information required to be controlled and maintained by an organization and the medium on which it is contained.' },
          { term: 'Process', definition: 'Set of interrelated or interacting activities that transforms inputs into outputs.' },
          { term: 'Procedure', definition: 'Specified way to carry out an activity or a process.' },
          { term: 'Performance', definition: 'Measurable result.' },
          { term: 'OH&S performance', definition: 'Performance related to the effectiveness of the prevention of injury and ill health to workers and the provision of safe and healthy workplaces.' },
          { term: 'Outsource', definition: 'Make an arrangement where an external organization performs part of an organization\'s function or process.' },
          { term: 'Monitoring', definition: 'Determining the status of a system, process or activity.' },
          { term: 'Measurement', definition: 'Process to determine a value.' },
          { term: 'Audit', definition: 'Systematic, independent and documented process for obtaining audit evidence and evaluating it objectively.' },
          { term: 'Nonconformity', definition: 'Non-fulfilment of a requirement.' },
          { term: 'Incident', definition: 'Occurrence arising out of, or in the course of, work that could or does result in injury and ill health.' },
          { term: 'Corrective action', definition: 'Action to eliminate the cause of a nonconformity or incident and to prevent recurrence.' },
          { term: 'Continual improvement', definition: 'Recurring activity to enhance performance.' },
          { term: 'Audit programme', definition: 'Arrangements for a set of one or more audits planned for a specific time frame and directed towards a specific purpose.' },
          { term: 'Risk assessment', definition: 'Overall process of risk identification, risk analysis and risk evaluation.' },
          { term: 'Hierarchy of controls', definition: 'Prioritized approach to eliminating or reducing OH&S risks, from elimination through substitution, engineering controls, administrative controls, to PPE.' },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CLAUSE 4 — Context of the Organization
  // ──────────────────────────────────────────────────────────────────────────
  {
    number: 4,
    id: '4',
    title: 'Context of the Organization',
    overview:
      'The foundation of the OH&S MS. Requires the organization to understand its internal and external environment, worker and stakeholder expectations, and to define the scope and structure of its OH&S management system.',
    isHLS: true,
    children: [
      {
        id: '4.1',
        number: '4.1',
        title: 'Understanding the Organization and Its Context',
        summary:
          'The organization must identify and regularly review internal and external issues that are relevant to its purpose and that affect its ability to achieve the intended outcomes of the OH&S MS. Internal issues include culture, structure, and capabilities. External issues include the regulatory environment, industry trends, and community expectations.',
        purpose:
          'To ensure the OH&S MS is designed to address the real-world factors affecting the organization, rather than being a generic, disconnected system.',
        requirements: [
          'Identify external issues relevant to OH&S: legal and regulatory landscape, industry practices, competitive environment, social and cultural factors.',
          'Identify internal issues: organizational culture, values, capabilities, resources, governance structure, and existing management systems.',
          'Document the relevant internal and external issues and review them at planned intervals (at minimum, during management review).',
          'Ensure the context analysis feeds directly into the risk and opportunity identification process (Clause 6.1).',
          'Consider national and local legislation, collective agreements, and technical standards applicable to the business.',
        ],
        auditQuestions: [
          'Can management demonstrate they have identified and analysed internal and external issues relevant to OH&S?',
          'Is there documented evidence of the context analysis, and is it kept up to date?',
          'How does the organization\'s context analysis feed into its risk assessment and planning process?',
          'When was the context last reviewed, and what changed as a result?',
        ],
        linkedModules: [
          { label: 'Risk Assessments', href: '/risk-assessments', available: false },
        ],
      },
      {
        id: '4.2',
        number: '4.2',
        title: 'Understanding the Needs and Expectations of Workers and Other Interested Parties',
        summary:
          'Beyond just workers, the organization must identify all relevant interested parties (stakeholders) and understand their needs and expectations in relation to OH&S. This includes contractors, customers, regulators, unions, neighbours, and emergency services. The organization must then determine which of these needs become legal or other compliance obligations.',
        purpose:
          'To ensure the OH&S MS accounts for all parties who have a stake in the organization\'s OH&S performance, particularly those who can influence or be affected by it.',
        requirements: [
          'Identify all interested parties relevant to the OH&S MS beyond just workers: regulators, contractors, suppliers, customers, community groups, emergency services, unions.',
          'Document the relevant needs and expectations of each identified interested party.',
          'Determine which needs and expectations have become, or could become, legal requirements or other compliance obligations.',
          'Actively involve workers in identifying their own needs and expectations (linked to Clause 5.4 — consultation and participation).',
          'Review the list of interested parties and their needs at planned intervals.',
        ],
        auditQuestions: [
          'Has the organization identified all relevant interested parties, including contractors and regulators?',
          'Is there a documented record of interested parties\' needs and expectations?',
          'How does the organization determine which stakeholder expectations translate into compliance obligations?',
          'How are worker needs and expectations specifically captured and addressed?',
        ],
        linkedModules: [],
      },
      {
        id: '4.3',
        number: '4.3',
        title: 'Determining the Scope of the OH&S Management System',
        summary:
          'The organization must determine the boundaries and applicability of the OH&S MS. The scope must consider the internal and external issues from 4.1, the requirements from 4.2, and the work activities performed. The scope must be documented and available to interested parties.',
        purpose:
          'To provide clarity about what is and is not covered by the OH&S MS, preventing ambiguity during audits, incidents, or regulatory inspections.',
        requirements: [
          'Document the scope statement in clear, unambiguous language.',
          'The scope must account for all sites, locations, activities, and workers under the organization\'s control.',
          'Consider whether contractors and visitors within the workplace fall under the scope.',
          'The scope cannot be used to exclude activities, products, or locations where OH&S risks exist that affect workers.',
          'Make the scope available to relevant interested parties (e.g. on request from a regulator or client).',
          'Review the scope whenever there are significant changes to the organization\'s activities or structure.',
        ],
        auditQuestions: [
          'Is the scope of the OH&S MS formally documented and accessible?',
          'Does the scope accurately reflect all sites, activities, and worker types under the organization\'s control?',
          'Were any activities deliberately excluded from scope, and if so, what is the justification?',
          'Has the scope been reviewed following any significant organizational changes?',
        ],
        linkedModules: [],
      },
      {
        id: '4.4',
        number: '4.4',
        title: 'OH&S Management System',
        summary:
          'Having defined its context, stakeholders, and scope, the organization must establish, implement, maintain, and continually improve an OH&S MS — including the processes needed and their interactions. This is the overarching requirement that brings all other clauses together into a functioning system.',
        purpose:
          'To mandate that the organization\'s OH&S activities are not ad hoc but form a structured, integrated, and self-improving system.',
        requirements: [
          'Establish all processes required by the standard and determine how they interact.',
          'Implement the OH&S MS across all in-scope activities, sites, and functions.',
          'Maintain the system through regular monitoring, review, and updating.',
          'Continually improve the system based on performance data, audit results, incident learnings, and management review outputs.',
          'Ensure the OH&S MS is integrated into the organization\'s core business processes, not treated as a standalone compliance exercise.',
        ],
        auditQuestions: [
          'Is there evidence that all required OH&S MS processes have been established and are being implemented?',
          'Can the organization demonstrate a functioning Plan-Do-Check-Act cycle across its OH&S system?',
          'How is the OH&S MS integrated with other management systems (quality, environment, etc.)?',
          'What evidence exists of continual improvement activity?',
        ],
        linkedModules: [],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CLAUSE 5 — Leadership and Worker Participation
  // ──────────────────────────────────────────────────────────────────────────
  {
    number: 5,
    id: '5',
    title: 'Leadership and Worker Participation',
    overview:
      'A core differentiator of ISO 45001 compared to its predecessor OHSAS 18001. Top management must demonstrate visible, active commitment to OH&S. Workers must be consulted on, and participate in, the decisions that affect their safety.',
    isHLS: true,
    children: [
      {
        id: '5.1',
        number: '5.1',
        title: 'Leadership and Commitment',
        summary:
          'Top management must take personal accountability for the effectiveness of the OH&S MS. This goes beyond delegating safety to an HSE team. It requires visible leadership behaviours: attending safety walkthroughs, including OH&S in business planning, and ensuring safety is never traded off against productivity or cost.',
        purpose:
          'To prevent OH&S from being a paper exercise. When safety is driven from the top, it becomes embedded in culture and decision-making at every level.',
        requirements: [
          'Top management must take overall accountability and responsibility for prevention of work-related injury and ill health.',
          'Establish, communicate, and model OH&S policy and objectives consistent with the strategic direction of the organization.',
          'Ensure integration of OH&S MS requirements into business processes.',
          'Provide adequate resources (financial, human, technical) for the OH&S MS.',
          'Communicate the importance of effective OH&S management and conforming to the OH&S MS requirements.',
          'Direct and support persons to contribute to the effectiveness of the OH&S MS.',
          'Ensure the OH&S MS achieves its intended outcomes.',
          'Support other relevant management roles in demonstrating their leadership in their areas of responsibility.',
          'Promote consultation and participation of workers (Clause 5.4).',
          'Support the establishment and functioning of health and safety committees where they exist.',
        ],
        auditQuestions: [
          'What evidence exists of top management\'s personal involvement in OH&S activities (e.g. toolbox talks, safety walks, meeting agendas)?',
          'How does top management ensure OH&S considerations are integrated into strategic business decisions?',
          'Can top management articulate the organization\'s OH&S policy and key objectives without referring to documents?',
          'What resources have been allocated specifically for OH&S in the current budget cycle?',
          'How does top management respond when productivity conflicts with safety?',
        ],
        linkedModules: [],
      },
      {
        id: '5.2',
        number: '5.2',
        title: 'OH&S Policy',
        summary:
          'Top management must establish a written OH&S policy. The policy provides high-level commitments that cascade down to objectives (Clause 6.2) and drive the entire system. It must be appropriate to the organization\'s context, be specific about commitments to consultation and participation, and include a commitment to continual improvement.',
        purpose:
          'To provide a clear, enduring statement of intent from leadership that workers, contractors, and regulators can rely upon.',
        requirements: [
          'The policy must include a commitment to provide safe and healthy working conditions for prevention of work-related injury and ill health.',
          'Include a commitment to fulfil legal requirements and other applicable requirements.',
          'Include a commitment to eliminate hazards and reduce OH&S risks.',
          'Include a commitment to consultation and participation of workers and workers\' representatives.',
          'Include a commitment to continual improvement of the OH&S MS to enhance OH&S performance.',
          'The policy must be documented and available to workers.',
          'Communicate the policy to all workers, contractors, and relevant interested parties.',
          'Review and update the policy at appropriate intervals.',
          'The policy must be appropriate to the nature and scale of the organization\'s OH&S risks.',
        ],
        auditQuestions: [
          'Does the OH&S policy include all five mandatory commitments (safe conditions, legal compliance, hazard elimination, worker participation, continual improvement)?',
          'Is the policy signed and dated by current top management?',
          'Is the policy displayed and accessible to all workers, including contractors?',
          'Can workers explain what the policy means for their day-to-day work?',
          'When was the policy last reviewed, and what prompted the review?',
        ],
        linkedModules: [
          { label: 'Documents', href: '/documents', available: false },
        ],
      },
      {
        id: '5.3',
        number: '5.3',
        title: 'Organizational Roles, Responsibilities and Authorities',
        summary:
          'Top management must ensure that responsibilities and authorities for OH&S-relevant roles are assigned, communicated, and understood at all levels. Every person with an OH&S function must know what they are responsible for and have the authority to fulfil that responsibility.',
        purpose:
          'To prevent accountability gaps where safety-critical tasks fall through the cracks because no one owns them.',
        requirements: [
          'Assign responsibility and authority for ensuring the OH&S MS conforms to standard requirements.',
          'Assign responsibility and authority for reporting OH&S performance to top management.',
          'Ensure responsibilities and authorities are documented and communicated.',
          'All persons must be aware of their own OH&S responsibilities.',
          'The delegation of OH&S responsibilities to line management must not remove top management\'s overall accountability.',
          'Workers must have the authority to remove themselves from work situations they reasonably believe present imminent and serious risk to their life or health.',
        ],
        auditQuestions: [
          'Are OH&S roles, responsibilities, and authorities documented (e.g. in job descriptions, organisation charts, or a RACI matrix)?',
          'Do role holders understand and can they articulate their specific OH&S responsibilities?',
          'Do workers know they have the right to stop work in the face of imminent danger?',
          'Is there a nominated individual responsible for OH&S MS conformity reporting to top management?',
        ],
        linkedModules: [],
      },
      {
        id: '5.4',
        number: '5.4',
        title: 'Consultation and Participation of Workers',
        summary:
          'A defining feature of ISO 45001 over OHSAS 18001. Workers must not just be informed — they must be actively consulted before decisions are made, and must be able to participate in the development and improvement of the OH&S MS. This includes non-managerial workers and their representatives.',
        purpose:
          'Workers are closest to the hazards. Their knowledge and engagement are critical to identifying real risks and implementing effective controls. Meaningful participation also improves safety culture.',
        requirements: [
          'Establish, implement, and maintain processes for consultation and participation of workers at all levels.',
          'Consult workers on determining the needs and expectations of interested parties (4.2), establishing the OH&S policy (5.2), assigning roles and responsibilities (5.3), planning hazard identification and risk assessment (6.1.2), and planning training (7.2).',
          'Consult workers on determining applicable legal requirements (6.1.3), establishing OH&S objectives (6.2), procurement and contractor management (8.1.4), incident investigation, and management of nonconformities.',
          'Ensure workers can participate without fear of reprisal, retribution, or coercion.',
          'Provide mechanisms for workers to raise concerns and suggest improvements.',
          'Remove barriers to participation such as language, literacy, time, or cost constraints.',
          'Maintain records of consultation activities.',
        ],
        auditQuestions: [
          'What formal mechanisms exist for worker consultation (e.g. safety committees, toolbox talks, surveys)?',
          'Can non-managerial workers demonstrate they have been consulted on, not just informed about, OH&S decisions?',
          'Are there health and safety committee meeting minutes showing active worker input into decisions?',
          'How are language or literacy barriers to participation addressed?',
          'Has management acted on worker-raised safety concerns, and is there evidence of this?',
        ],
        linkedModules: [],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CLAUSE 6 — Planning
  // ──────────────────────────────────────────────────────────────────────────
  {
    number: 6,
    id: '6',
    title: 'Planning',
    overview:
      'The planning clause drives the proactive, risk-based approach of ISO 45001. It requires systematic hazard identification, risk assessment, legal compliance planning, and the setting of measurable OH&S objectives with action plans to achieve them.',
    isHLS: true,
    children: [
      {
        id: '6.1',
        number: '6.1',
        title: 'Actions to Address Risks and Opportunities',
        summary:
          'The organization must plan how to address the OH&S risks, legal requirements, and other issues identified through its context analysis, stakeholder analysis, and scope definition. This is the strategic risk planning section.',
        purpose:
          'To ensure the OH&S MS proactively addresses what could go wrong, rather than reacting after incidents occur.',
        requirements: [
          'Consider the context (4.1), interested party requirements (4.2), and the scope of the OH&S MS (4.3) when planning.',
          'Determine the risks and opportunities that need to be addressed to give assurance the OH&S MS can achieve its intended outcomes.',
          'Plan to address these risks and opportunities, integrating and implementing actions into the OH&S MS processes.',
          'Evaluate the effectiveness of these actions.',
        ],
        auditQuestions: [
          'Is there a documented process for identifying and addressing OH&S risks and opportunities?',
          'Does the planning process explicitly connect context and stakeholder requirements to risk identification?',
        ],
        linkedModules: [
          { label: 'Risk Assessments', href: '/risk-assessments', available: false },
        ],
        children: [
          {
            id: '6.1.1',
            number: '6.1.1',
            title: 'General',
            summary:
              'Sets out the overarching requirement for the planning process. When planning for the OH&S MS, the organization must consider the outputs of Clauses 4.1, 4.2, and 4.3, and determine the risks and opportunities that need to be addressed to achieve the intended outcomes of the OH&S MS, prevent or reduce undesired effects, and achieve continual improvement.',
            purpose:
              'To ensure planning is not done in isolation but builds systematically on the organization\'s context, stakeholder requirements, and scope.',
            requirements: [
              'The planning process must be informed by the outputs of context analysis (4.1) and interested party requirements (4.2).',
              'Determine risks and opportunities related to: OH&S risks; OH&S opportunities; other risks (to the management system); and other opportunities (for system improvement).',
              'Plan how to integrate and implement actions into OH&S MS processes.',
              'Maintain documented information on risks and opportunities and plans to address them.',
            ],
            auditQuestions: [
              'How does the organization link context analysis outputs to its planning activities?',
              'Is there documented evidence of how risks and opportunities were determined?',
              'Are plans for addressing risks and opportunities integrated into operational processes?',
            ],
            linkedModules: [
              { label: 'Risk Assessments', href: '/risk-assessments', available: false },
            ],
          },
          {
            id: '6.1.2',
            number: '6.1.2',
            title: 'Hazard Identification and Assessment of Risks and Opportunities',
            summary:
              'A continuous, proactive process for systematically identifying workplace hazards and assessing the associated OH&S risks. The methodology must be defined, implemented, and maintained. It must consider both routine and non-routine activities, human factors, and existing controls. Opportunities to improve OH&S performance must also be assessed.',
            purpose:
              'Hazard identification and risk assessment is the engine of any effective OH&S MS. Without understanding what can go wrong and how likely/severe it is, no meaningful controls can be selected.',
            requirements: [
              'Establish, implement, and maintain a documented process for hazard identification that is proactive (not just reactive to incidents).',
              'Hazard identification must cover: routine and non-routine work activities; human factors (behaviour, capabilities, fatigue); infrastructure, equipment, and materials; workplace design; work organization and social factors; past incidents and near misses.',
              'Assess OH&S risks associated with identified hazards, taking into account the effectiveness of existing controls.',
              'Assess OH&S opportunities and other opportunities for improving the OH&S MS.',
              'Document methodology, assessment results, and the criteria used for evaluating significance.',
              'Include activities of contractors and visitors in the scope of hazard identification.',
              'Review risk assessments when changes occur (Clause 8.1.3) and at planned intervals.',
            ],
            auditQuestions: [
              'Is there a formal, documented hazard identification and risk assessment methodology?',
              'Does the hazard register cover all work activities, including non-routine tasks, maintenance, and contractor activities?',
              'How are human factors (fatigue, stress, distraction) considered in the risk assessment process?',
              'When were risk assessments last reviewed, and what triggered the review?',
              'How are identified risks prioritized, and what criteria are used?',
              'Are OH&S opportunities (not just risks) identified and documented?',
            ],
            linkedModules: [
              { label: 'Risk Assessments', href: '/risk-assessments', available: false },
              { label: 'Incidents', href: '/incidents', available: true },
            ],
          },
          {
            id: '6.1.3',
            number: '6.1.3',
            title: 'Determination of Legal Requirements and Other Requirements',
            summary:
              'The organization must establish and maintain a process to identify, access, and keep up to date with all applicable legal requirements and other requirements (e.g. industry codes of practice, collective agreements, client requirements). It must determine how these requirements apply to its operations and communicate them to relevant workers.',
            purpose:
              'Regulatory compliance is a baseline obligation. Organizations that do not know what laws apply to them cannot comply with them. This clause drives a systematic compliance register.',
            requirements: [
              'Establish, implement, and maintain a process to identify and access current applicable OH&S legal requirements and other requirements.',
              'Determine how these requirements apply to the organization\'s specific activities, products, and services.',
              'Maintain a register of applicable legal and other requirements (a compliance obligations register or legal register).',
              'Update the register when laws or requirements change, or when the organization\'s activities change.',
              'Communicate relevant requirements to workers and other relevant interested parties.',
              'Include legal requirements as inputs to the planning process and risk assessment.',
            ],
            auditQuestions: [
              'Is there a current, maintained legal register covering all applicable OH&S legislation and regulations?',
              'How does the organization stay informed of changes to applicable legal requirements?',
              'Is responsibility for maintaining the legal register assigned to a specific role?',
              'Can workers identify the key regulations that apply to their work activities?',
              'How are changes to legal requirements communicated to relevant personnel?',
            ],
            linkedModules: [
              { label: 'Documents', href: '/documents', available: false },
            ],
          },
          {
            id: '6.1.4',
            number: '6.1.4',
            title: 'Planning Action',
            summary:
              'Having identified risks, opportunities, and legal requirements, the organization must plan specific actions to address them. These actions must be integrated into the OH&S MS processes and broader business processes. The organization must consider how actions can be evaluated for effectiveness.',
            purpose:
              'Identification without action is worthless. This clause ensures that risk assessment outputs and compliance gaps translate into concrete, implemented controls.',
            requirements: [
              'Plan actions to: address OH&S risks and opportunities (6.1.1); address legal requirements and other requirements (6.1.3); and prepare for and respond to emergency situations (8.2).',
              'Determine how actions will be integrated into OH&S MS processes and other business processes.',
              'Consider how effectiveness of actions will be evaluated.',
              'Consider the hierarchy of controls when planning risk reduction actions (see 8.1.2).',
              'Maintain documented information of planned actions.',
            ],
            auditQuestions: [
              'Is there an action plan or treatment register showing how identified risks and legal gaps are being addressed?',
              'Do planned actions consider the hierarchy of controls (elimination first, PPE last)?',
              'How are action owners, timelines, and effectiveness criteria assigned?',
              'Are OH&S actions integrated into operational plans and budgets, or managed in isolation?',
            ],
            linkedModules: [
              { label: 'Corrective Actions', href: '/corrective-actions', available: false },
              { label: 'Risk Assessments', href: '/risk-assessments', available: false },
            ],
          },
        ],
      },
      {
        id: '6.2',
        number: '6.2',
        title: 'OH&S Objectives and Planning to Achieve Them',
        summary:
          'The organization must establish OH&S objectives at relevant functions and levels, with measurable targets, action plans, and resource allocation. Objectives must be consistent with the OH&S policy and the results of risk assessment.',
        purpose:
          'To drive continual improvement through measurable goal-setting, not just by maintaining baseline compliance.',
        requirements: [
          'Establish OH&S objectives for all relevant functions and levels.',
          'Objectives must be consistent with the OH&S policy.',
          'Objectives should be measurable, monitored, communicated, and updated as appropriate.',
          'Develop action plans specifying what will be done, what resources are required, who is responsible, completion timelines, and how results will be evaluated.',
          'Retain documented information on OH&S objectives and plans to achieve them.',
        ],
        auditQuestions: [
          'Are OH&S objectives documented, measurable, and aligned with the OH&S policy?',
          'Do objectives address the significant risks and opportunities identified in the planning phase?',
          'Is there an action plan for each objective with clear owners and deadlines?',
          'How is progress against objectives monitored and reported?',
          'How were workers involved in setting OH&S objectives?',
        ],
        linkedModules: [
          { label: 'Objectives & KPIs', href: '/objectives', available: false },
          { label: 'Reports', href: '/reports', available: false },
        ],
        children: [
          {
            id: '6.2.1',
            number: '6.2.1',
            title: 'OH&S Objectives',
            summary:
              'OH&S objectives must be established at relevant functions and levels. They must be consistent with the OH&S policy, measurable (or capable of performance evaluation), take into account applicable requirements, risk assessment results, and opportunities for continual improvement. They must be monitored, communicated, and updated as appropriate.',
            purpose:
              'Measurable objectives transform policy commitments into operational reality. They provide the direction that drives the entire planning-to-improvement cycle.',
            requirements: [
              'Objectives must be consistent with the OH&S policy.',
              'Objectives must be measurable where practicable.',
              'Objectives must take into account applicable legal and other requirements.',
              'Objectives must reflect the significant OH&S risks identified in the risk assessment.',
              'Objectives must be monitored and reviewed at planned intervals.',
              'Objectives must be communicated to workers at relevant levels.',
              'Retain documented information on OH&S objectives.',
            ],
            auditQuestions: [
              'Are OH&S objectives documented with measurable targets?',
              'Do the objectives directly address the most significant OH&S risks in the organisation?',
              'How are objectives cascaded to relevant functions and communicated to workers?',
              'Are objectives reviewed at management review meetings?',
            ],
            linkedModules: [
              { label: 'Objectives & KPIs', href: '/objectives', available: false },
            ],
          },
          {
            id: '6.2.2',
            number: '6.2.2',
            title: 'Planning to Achieve OH&S Objectives',
            summary:
              'For each OH&S objective, the organization must plan specifically: what will be done, what resources are required, who will be responsible, when it will be completed, and how the results will be evaluated — including indicators for monitoring progress.',
            purpose:
              'Without a detailed plan, objectives become aspirational statements with no operational traction.',
            requirements: [
              'For each objective, determine: what actions will be taken; what resources are needed; who is responsible; when the objective will be achieved; how results will be evaluated (metrics, KPIs).',
              'Consider how actions to achieve objectives can be integrated into business processes.',
              'Maintain documented information as evidence of planning and progress.',
            ],
            auditQuestions: [
              'Does each OH&S objective have a corresponding action plan with owner, deadline, and KPIs?',
              'Are resources (budget, personnel, time) formally allocated for each objective?',
              'How is progress tracked — what system or tool is used?',
              'What happens when an objective is not achieved on time?',
            ],
            linkedModules: [
              { label: 'Objectives & KPIs', href: '/objectives', available: false },
            ],
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CLAUSE 7 — Support
  // ──────────────────────────────────────────────────────────────────────────
  {
    number: 7,
    id: '7',
    title: 'Support',
    overview:
      'The enablers clause. For the OH&S MS to function, the organization must provide the right resources, ensure people are competent, build awareness, establish effective communication, and control the documented information that underpins the system.',
    isHLS: true,
    children: [
      {
        id: '7.1',
        number: '7.1',
        title: 'Resources',
        summary:
          'Top management must determine and provide the resources needed to establish, implement, maintain, and continually improve the OH&S MS. Resources include financial, human, infrastructure, technological, and time resources.',
        purpose:
          'An OH&S MS that is underfunded or under-resourced will fail. This clause makes resource provision a formal leadership obligation.',
        requirements: [
          'Determine and provide the human, financial, infrastructure, and technological resources required by the OH&S MS.',
          'Resources must be sufficient to implement all processes, controls, and improvement activities.',
          'Resource allocation must be reviewed as part of management review.',
          'Where specialist OH&S expertise is not available internally, external resources (consultants, service providers) may be used but responsibility remains with the organization.',
        ],
        auditQuestions: [
          'Has the organization formally budgeted for OH&S resources in the current period?',
          'Are there any known OH&S resource gaps (personnel, equipment, training budget)?',
          'How are OH&S resource needs identified and escalated to top management?',
          'Is there evidence that resource constraints have been raised at management review?',
        ],
        linkedModules: [],
      },
      {
        id: '7.2',
        number: '7.2',
        title: 'Competence',
        summary:
          'The organization must ensure that all workers who affect OH&S performance are competent — possessing the appropriate education, training, or experience. Where competency gaps exist, action must be taken and its effectiveness evaluated.',
        purpose:
          'Incompetent workers create hazards. Competence is not just about holding certificates; it means workers can actually perform their tasks safely under real conditions.',
        requirements: [
          'Determine the necessary competencies for workers whose work affects OH&S performance.',
          'Ensure workers are competent on the basis of appropriate education, training, or experience.',
          'Where applicable, take action to acquire or maintain necessary competence and evaluate the effectiveness of actions taken.',
          'Retain documented information as evidence of competence (training records, qualifications, assessments).',
          'Consider the competency needs of contractors and others working on the organization\'s behalf.',
          'Include hazard-specific competencies (e.g. working at height, confined space entry, forklift operation).',
        ],
        auditQuestions: [
          'Is there a competency framework or training matrix defining required competencies by role?',
          'Are training records maintained and current for all workers?',
          'How does the organization evaluate whether training has been effective?',
          'How are competency requirements for contractors verified before they begin work?',
          'Are there any identified competency gaps, and what is the plan to address them?',
        ],
        linkedModules: [],
      },
      {
        id: '7.3',
        number: '7.3',
        title: 'Awareness',
        summary:
          'All workers must be aware of the OH&S policy, their contribution to the OH&S MS, the benefits of improved OH&S performance, the implications of not conforming to requirements, and hazards and risks relevant to their work. Awareness is broader than training — it is about genuine understanding and commitment.',
        purpose:
          'Workers who understand why safety matters, and understand the risks specific to their work, make better safety decisions. Awareness transforms compliance into culture.',
        requirements: [
          'Workers must be aware of the OH&S policy and OH&S objectives.',
          'Workers must understand their contribution to the effectiveness of the OH&S MS, including benefits of improved performance.',
          'Workers must be aware of the implications of not conforming to OH&S MS requirements (potential for incidents, legal consequences).',
          'Workers must be aware of the hazards and risks relevant to their specific roles and tasks.',
          'Workers must be aware of their right to remove themselves from imminent and serious danger situations.',
          'Awareness must be maintained over time — not just a one-off induction.',
        ],
        auditQuestions: [
          'Can workers explain the organization\'s OH&S policy in their own words?',
          'Are workers aware of the specific hazards in their work area and the controls in place?',
          'Do workers know they have the right to stop unsafe work without fear of retaliation?',
          'How is OH&S awareness reinforced beyond initial induction (e.g. toolbox talks, notices, refresher training)?',
        ],
        linkedModules: [],
      },
      {
        id: '7.4',
        number: '7.4',
        title: 'Communication',
        summary:
          'The organization must establish processes for internal and external OH&S communication. Communication must be timely, relevant, and appropriate to the audience. The "what, when, who, how" of communication must be planned and managed.',
        purpose:
          'Poor communication is a root cause of many safety incidents. This clause ensures that safety-critical information reaches the right people at the right time.',
        requirements: [
          'Establish, implement, and maintain processes for internal and external OH&S communication.',
          'Determine what, when, with whom, and how to communicate on OH&S matters.',
          'Communication must take into account diversity (language, literacy, culture).',
          'Workers must be able to raise OH&S concerns through accessible reporting channels.',
          'Maintain documented information as evidence of communication activities.',
        ],
        auditQuestions: [
          'Is there a documented OH&S communication plan or process?',
          'How does the organization communicate with contractors and visitors about relevant OH&S information?',
          'How are OH&S lessons learned and alerts communicated across the organization?',
          'Are communication channels accessible to all workers, regardless of language or literacy level?',
        ],
        linkedModules: [],
        children: [
          {
            id: '7.4.1',
            number: '7.4.1',
            title: 'General',
            summary:
              'The organization must establish, implement, and maintain processes for internal and external communications relevant to the OH&S MS. This requires planning who communicates what, to whom, when, and through which channels.',
            purpose:
              'To ensure OH&S communication is structured and deliberate, not left to chance.',
            requirements: [
              'Determine what OH&S information needs to be communicated.',
              'Determine when communication should occur (triggered by events, regular schedule, ad hoc).',
              'Determine with whom communication should occur (internal and external).',
              'Determine how communication will be carried out (channel, format).',
              'Take into account diversity aspects (language, literacy) when designing communications.',
              'Ensure communications contribute to continual improvement and not just compliance.',
            ],
            auditQuestions: [
              'Is there a communication matrix or plan detailing the OH&S communication process?',
              'Are communication requirements formally documented?',
              'Is OH&S communication evaluated for effectiveness?',
            ],
            linkedModules: [],
          },
          {
            id: '7.4.2',
            number: '7.4.2',
            title: 'Internal Communication',
            summary:
              'The organization must communicate OH&S information internally among levels and functions, including changes to the OH&S MS. Workers must be able to raise concerns, identify hazards, and suggest improvements through accessible internal channels.',
            purpose:
              'Internal communication closes information loops: hazard reports reach management, policy changes reach workers, and lessons learned reach the people who need them.',
            requirements: [
              'Communicate relevant OH&S information between different levels and functions of the organization.',
              'Communicate changes to the OH&S MS (new policies, procedures, risk assessments) to affected workers.',
              'Enable workers to contribute to continual improvement through upward communication channels.',
              'Ensure communication reaches temporary workers and contractors as well as permanent employees.',
            ],
            auditQuestions: [
              'How are safety alerts and OH&S updates communicated to workers on the ground?',
              'What channels exist for workers to raise hazard observations and near misses?',
              'How are changes to OH&S procedures communicated to affected workers before the change takes effect?',
            ],
            linkedModules: [
              { label: 'Incidents', href: '/incidents', available: true },
            ],
          },
          {
            id: '7.4.3',
            number: '7.4.3',
            title: 'External Communication',
            summary:
              'The organization must communicate relevant OH&S information to external parties — including regulators, contractors, visitors, emergency services, and neighbouring communities — as determined by the communication plan and legal requirements.',
            purpose:
              'External parties who interact with the organization\'s workplace must have the OH&S information they need to protect themselves and others.',
            requirements: [
              'Communicate OH&S information to contractors before and during their work in the organization\'s workplace.',
              'Respond to external communications on OH&S matters (e.g. regulator queries, contractor requests for hazard information).',
              'Communicate with emergency services to ensure preparedness for emergency response.',
              'Report to regulators as required by applicable legal requirements (e.g. notifiable incident reporting).',
            ],
            auditQuestions: [
              'How does the organization communicate OH&S induction requirements to contractors and visitors?',
              'Is there a process for notifying regulators of notifiable incidents within required timeframes?',
              'Has the organization shared emergency response information with local emergency services?',
            ],
            linkedModules: [
              { label: 'Incidents', href: '/incidents', available: true },
            ],
          },
        ],
      },
      {
        id: '7.5',
        number: '7.5',
        title: 'Documented Information',
        summary:
          'The OH&S MS must be supported by appropriate documented information — evidence that the system is operating as intended. This includes both documents (procedures, policies, risk assessments) and records (evidence of activities performed). The organization must control how information is created, updated, and retained.',
        purpose:
          'Without documented evidence, claims of compliance cannot be verified. Documented information is the backbone of any auditable management system.',
        requirements: [
          'The OH&S MS must include documented information required by the standard and determined as necessary for effectiveness.',
          'Establish controls for creating, updating, and distributing documented information.',
          'Ensure documented information is available when and where needed.',
          'Protect documented information from inappropriate use or loss of integrity.',
          'Retain documented information as evidence of OH&S performance (records).',
          'Documented information of external origin must be identified and controlled.',
        ],
        auditQuestions: [
          'Is there a document control procedure that governs creation, review, approval, and distribution?',
          'Are all required documented information items identified and maintained?',
          'How does the organization prevent use of obsolete documents?',
          'How long are OH&S records retained, and is this consistent with legal requirements?',
        ],
        linkedModules: [
          { label: 'Documents', href: '/documents', available: false },
        ],
        children: [
          {
            id: '7.5.1',
            number: '7.5.1',
            title: 'General',
            summary:
              'The OH&S MS must include documented information required by the standard (mandatory) as well as documented information determined by the organization as necessary for the effectiveness of the OH&S MS (discretionary). The appropriate extent of documented information varies by organization size, complexity, and worker competence.',
            purpose:
              'To calibrate the documentation burden: not too little (which creates compliance gaps) and not too much (which creates an unmanageable paper system).',
            requirements: [
              'Maintain all documented information explicitly required by ISO 45001:2018.',
              'Determine what additional documented information is needed for the system to function effectively.',
              'Recognize that the extent of documentation should be proportionate to the organization\'s size, activities, and risk profile.',
            ],
            auditQuestions: [
              'Has the organization identified all mandatory documented information required by the standard?',
              'Is there a master list or document register of all OH&S documents?',
              'Is the level of documentation proportionate to the organization\'s complexity and risk?',
            ],
            linkedModules: [
              { label: 'Documents', href: '/documents', available: false },
            ],
          },
          {
            id: '7.5.2',
            number: '7.5.2',
            title: 'Creating and Updating',
            summary:
              'When creating and updating documented information, the organization must ensure appropriate identification and description, format and media, and review and approval for suitability and adequacy.',
            purpose:
              'To ensure documents are clear, fit for purpose, approved by the right people, and in a usable format.',
            requirements: [
              'Documents must have appropriate identification (title, date, author, version number, document number).',
              'Documents must be in an appropriate format and medium (electronic, paper).',
              'Documents must be reviewed and approved before issue and re-issue.',
              'Version control must be in place to distinguish current from superseded versions.',
            ],
            auditQuestions: [
              'Do documents have version numbers, approval signatures, and dates?',
              'Is there a review cycle defined for each document type?',
              'How are employees prevented from using superseded versions?',
            ],
            linkedModules: [
              { label: 'Documents', href: '/documents', available: false },
            ],
          },
          {
            id: '7.5.3',
            number: '7.5.3',
            title: 'Control of Documented Information',
            summary:
              'The organization must control documented information to ensure availability, suitability, adequate protection, and distribution. This includes information of external origin. A balance must be struck between making information accessible and protecting it from misuse or unintentional alteration.',
            purpose:
              'Document control prevents the wrong version of a procedure being used in the field, which can directly cause incidents.',
            requirements: [
              'Documented information must be available and suitable for use, where and when needed.',
              'Documented information must be adequately protected (against loss, damage, or unauthorized access).',
              'Address distribution, access, retrieval, and use.',
              'Address storage, preservation, and legibility.',
              'Address control of changes (version control).',
              'Address retention and disposition (how long to keep records and what to do when they expire).',
              'Identify and control documented information of external origin (legislation, manufacturer manuals, client standards).',
            ],
            auditQuestions: [
              'How are documents stored and made accessible to those who need them?',
              'What access controls are in place to prevent unauthorized editing?',
              'What is the retention schedule for OH&S records, and is it legally compliant?',
              'How is externally sourced documented information (e.g. regulations, SDSs) managed?',
            ],
            linkedModules: [
              { label: 'Documents', href: '/documents', available: false },
            ],
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CLAUSE 8 — Operation
  // ──────────────────────────────────────────────────────────────────────────
  {
    number: 8,
    id: '8',
    title: 'Operation',
    overview:
      'The doing clause. Translates the planning into operational reality through hazard controls (using the hierarchy of controls), management of change, procurement and contractor management, and emergency preparedness. This is where safety is enacted in day-to-day work.',
    isHLS: true,
    children: [
      {
        id: '8.1',
        number: '8.1',
        title: 'Operational Planning and Control',
        summary:
          'The organization must plan, implement, control, and maintain the processes needed to meet requirements and implement the actions identified in planning (Clause 6). This includes establishing operating criteria and implementing controls based on those criteria.',
        purpose:
          'To ensure hazard controls identified in planning are consistently implemented in day-to-day operations, not just documented.',
        requirements: [
          'Establish and implement operational controls proportional to identified risks.',
          'Ensure operational controls are communicated to all workers who need to apply them.',
          'Maintain documented information to support operational control processes.',
          'Adapt work to workers (ergonomics, capacity), not just workers to work.',
        ],
        auditQuestions: [
          'Are operational controls consistent with the risk assessment outcomes?',
          'Are safe work procedures available and accessible at the point of use?',
          'How does the organization verify that operational controls are being followed in practice?',
        ],
        linkedModules: [
          { label: 'Risk Assessments', href: '/risk-assessments', available: false },
        ],
        children: [
          {
            id: '8.1.1',
            number: '8.1.1',
            title: 'General',
            summary:
              'The organization must plan, implement, control, and maintain the processes needed to meet OH&S MS requirements and implement the actions determined in Clause 6. This requires establishing operating criteria for processes, implementing control of processes in accordance with operating criteria, and maintaining documented information sufficient to demonstrate processes have been carried out as planned.',
            purpose:
              'To give the "how" to the "what" of planning — translating action items into repeatable, controlled operational practices.',
            requirements: [
              'Plan, implement, control, and maintain processes to meet OH&S MS requirements.',
              'Establish operating criteria (safe work procedures, permit-to-work systems, standards) for processes where deviation could lead to injury.',
              'Implement controls in accordance with established criteria.',
              'Adapt work tasks, procedures, and systems to suit workers (ergonomics, work-life balance, mental health).',
              'Maintain documented information to confirm processes are being carried out as planned.',
            ],
            auditQuestions: [
              'Are documented safe work procedures available for all high-risk tasks?',
              'How does the organization verify that operational procedures are being followed?',
              'Is there a permit-to-work system for high-hazard activities (hot work, confined space, working at height)?',
              'How are ergonomic risks and mental health considerations addressed in work design?',
            ],
            linkedModules: [
              { label: 'Risk Assessments', href: '/risk-assessments', available: false },
              { label: 'Audits', href: '/audits', available: false },
            ],
          },
          {
            id: '8.1.2',
            number: '8.1.2',
            title: 'Eliminating Hazards and Reducing OH&S Risks',
            summary:
              'The organization must implement a hierarchy of controls to eliminate hazards and reduce OH&S risks. The hierarchy prioritizes permanent, higher-order controls (elimination, substitution, engineering) over lower-order, behaviour-dependent controls (administrative, PPE). PPE should be the last resort, not the first response.',
            purpose:
              'The hierarchy of controls is the most fundamental principle in occupational safety. It prevents organizations from defaulting to the cheapest control (PPE) rather than the most effective one (elimination).',
            requirements: [
              'Apply the hierarchy of controls in the following order of priority: 1. Elimination — remove the hazard entirely; 2. Substitution — replace the hazard with something less dangerous; 3. Engineering controls — isolate people from the hazard (guards, interlocks, ventilation); 4. Administrative controls — safe work procedures, job rotation, training, signage; 5. Personal Protective Equipment (PPE) — last resort.',
              'Document the rationale for the selected control level when a higher-order control was practicable but not implemented.',
              'Combine controls where a single control is insufficient to reduce risk to an acceptable level.',
              'Ensure controls account for the needs of all workers, including those with disabilities, pregnant workers, and non-native language speakers.',
              'Review control effectiveness regularly and after any incident.',
            ],
            auditQuestions: [
              'Can the organization demonstrate that higher-order controls were considered before resorting to PPE?',
              'Is there evidence that engineering controls have been implemented to reduce reliance on PPE?',
              'How does the organization verify that PPE is appropriate, maintained, and being used correctly?',
              'When were control measures last reviewed for effectiveness?',
              'Are there examples of hazards that have been fully eliminated in recent periods?',
            ],
            linkedModules: [
              { label: 'Risk Assessments', href: '/risk-assessments', available: false },
              { label: 'Incidents', href: '/incidents', available: true },
            ],
          },
          {
            id: '8.1.3',
            number: '8.1.3',
            title: 'Management of Change',
            summary:
              'Changes within the organization can introduce new or modified hazards. The organization must establish a formal process to evaluate the OH&S implications of planned changes (and unplanned changes before they are implemented). Changes include new processes, equipment, technology, personnel, regulations, and knowledge.',
            purpose:
              'Many serious incidents occur during or shortly after a change. A formal change management process ensures that safety assessments are performed before changes are implemented.',
            requirements: [
              'Establish a process for assessing the OH&S implications of planned changes before implementation.',
              'Temporary and permanent changes must both be assessed.',
              'Changes to be assessed include: new or modified products, processes, or services; organizational changes; technology changes; changes in workforce; changes in applicable requirements; changes in knowledge about hazards and risks.',
              'After assessment, adjust controls as necessary before implementing the change.',
              'Communicate the change and its safety implications to affected workers.',
              'Review the effectiveness of the implemented change after a defined period.',
            ],
            auditQuestions: [
              'Is there a formal management of change procedure?',
              'Can the organization demonstrate that recent changes (new equipment, process changes, personnel changes) were assessed for OH&S impacts before implementation?',
              'How are temporary changes (maintenance, trials) managed under the change process?',
              'Are records maintained of all change assessments?',
            ],
            linkedModules: [
              { label: 'Risk Assessments', href: '/risk-assessments', available: false },
            ],
          },
          {
            id: '8.1.4',
            number: '8.1.4',
            title: 'Procurement',
            summary:
              'The organization must establish processes to manage the OH&S risks associated with procurement of goods, services, and contractors. This extends the OH&S MS to the supply chain and to all parties working on the organization\'s behalf.',
            purpose:
              'Contractor-related incidents are a leading cause of workplace fatalities globally. Procurement processes must screen for safety capability, not just price and quality.',
            requirements: [
              'Establish processes to control the procurement of goods, services, and contractors.',
              'Coordinate procurement with contractors to identify hazards and assess risks before work begins.',
              'Ensure contractors comply with the organization\'s OH&S requirements while on site.',
              'Define and apply OH&S criteria in procurement/tendering processes.',
            ],
            auditQuestions: [
              'Are OH&S requirements included in contractor pre-qualification and tendering processes?',
              'How does the organization verify contractor OH&S performance during work?',
              'Is there evidence of contractor induction and site-specific hazard communication?',
            ],
            linkedModules: [],
            children: [
              {
                id: '8.1.4.1',
                number: '8.1.4.1',
                title: 'General',
                summary:
                  'The organization must establish, implement, and maintain processes to control the procurement of products (goods) and services to ensure they conform to the organization\'s OH&S MS. This means ensuring that purchased materials, equipment, and services do not introduce uncontrolled hazards into the workplace.',
                purpose:
                  'Unsafe equipment and materials purchased without OH&S due diligence become hazards the moment they enter the workplace.',
                requirements: [
                  'Determine OH&S requirements for purchased products and services before procurement.',
                  'Ensure purchased equipment conforms to applicable legal requirements and OH&S standards.',
                  'Communicate OH&S requirements to suppliers and service providers.',
                  'Verify conformance of received goods and services with OH&S requirements before use.',
                ],
                auditQuestions: [
                  'Are OH&S requirements incorporated into purchase orders and procurement specifications?',
                  'How does the organization verify that procured equipment and materials are safe and legal?',
                  'Is there a process for rejecting or quarantining goods that do not meet OH&S requirements?',
                ],
                linkedModules: [],
              },
              {
                id: '8.1.4.2',
                number: '8.1.4.2',
                title: 'Contractors',
                summary:
                  'The organization must coordinate with contractors to identify hazards and assess and control risks from: the contractor\'s activities and operations that impact the organization\'s workers; the organization\'s activities that impact the contractor\'s workers; and the contractor\'s activities that impact other interested parties in the workplace.',
                purpose:
                  'Contractors often work in unfamiliar environments and are exposed to hazards they may not be aware of. Systematic coordination prevents contractor fatalities and incidents.',
                requirements: [
                  'Coordinate with contractors to identify workplace hazards and mutually agree on controls before work commences.',
                  'Communicate the organization\'s OH&S requirements to contractors before work begins.',
                  'Communicate the applicable OH&S requirements to contractors during the execution of the contracted work.',
                  'Define the criteria for selecting contractors, incorporating OH&S performance.',
                  'Verify contractor OH&S performance during execution of work.',
                  'Report to contractors on OH&S hazards applicable to them.',
                  'Ensure contractors provide their workers with appropriate OH&S induction.',
                ],
                auditQuestions: [
                  'Is there a contractor management procedure covering pre-qualification, induction, supervision, and performance review?',
                  'What pre-work safety meetings or kick-off processes are held with contractors before high-risk work begins?',
                  'How does the organization monitor contractor OH&S compliance during the work?',
                  'Are contractor incident and near miss data captured and analysed?',
                ],
                linkedModules: [
                  { label: 'Incidents', href: '/incidents', available: true },
                ],
              },
              {
                id: '8.1.4.3',
                number: '8.1.4.3',
                title: 'Outsourcing',
                summary:
                  'When the organization outsources functions or processes to external providers, it must ensure that outsourced arrangements do not adversely affect its ability to achieve the intended outcomes of the OH&S MS. The extent and type of control to apply to outsourced processes should reflect the degree of OH&S risk involved.',
                purpose:
                  'Outsourcing does not transfer legal responsibility or ISO certification obligations. The organization remains accountable for OH&S outcomes even for outsourced activities.',
                requirements: [
                  'Ensure outsourced functions do not compromise the OH&S MS\'s intended outcomes.',
                  'Apply appropriate levels of control to outsourced processes based on the OH&S risks involved.',
                  'Include OH&S requirements in outsourcing contracts.',
                  'Monitor the OH&S performance of outsourced providers.',
                ],
                auditQuestions: [
                  'Are OH&S requirements included in outsourcing contracts and service level agreements?',
                  'How does the organization satisfy itself that outsourced providers are managing OH&S effectively?',
                  'Has responsibility for any OH&S functions been outsourced, and if so, how is oversight maintained?',
                ],
                linkedModules: [],
              },
            ],
          },
        ],
      },
      {
        id: '8.2',
        number: '8.2',
        title: 'Emergency Preparedness and Response',
        summary:
          'The organization must establish, implement, and maintain processes for potential emergency situations including how to respond to them. Emergency response must be planned, practiced through drills, reviewed after actual emergencies, and communicated to all relevant parties.',
        purpose:
          'Effective emergency response is the difference between a contained incident and a catastrophe. Preparedness saves lives.',
        requirements: [
          'Establish a process to prepare for and respond to potential emergency situations.',
          'Plan emergency responses, including first aid and fire response.',
          'Provide training for planned responses.',
          'Test planned responses and review after drills and actual emergencies.',
          'Communicate relevant information to all workers on their duties and responsibilities in emergency situations.',
          'Communicate relevant emergency preparedness information to contractors, visitors, and emergency services.',
          'Consider the needs of all relevant interested parties (including emergency services) when developing response plans.',
          'Retain documented information on processes and plans for potential emergency situations.',
        ],
        auditQuestions: [
          'Is there a current, documented emergency response plan covering all plausible emergency scenarios?',
          'Are emergency response drills conducted at planned intervals, and are results recorded?',
          'Are all workers aware of emergency procedures, evacuation routes, and assembly points?',
          'Have emergency response plans been shared with local emergency services?',
          'When was the emergency response plan last reviewed and updated?',
          'Are first aid facilities and trained first aiders available and adequate for the hazard profile?',
        ],
        linkedModules: [
          { label: 'Incidents', href: '/incidents', available: true },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CLAUSE 9 — Performance Evaluation
  // ──────────────────────────────────────────────────────────────────────────
  {
    number: 9,
    id: '9',
    title: 'Performance Evaluation',
    overview:
      'The checking clause. Requires the organization to measure and monitor OH&S performance, evaluate compliance with legal obligations, conduct internal audits, and hold management reviews. Data gathered here feeds the improvement cycle.',
    isHLS: true,
    children: [
      {
        id: '9.1',
        number: '9.1',
        title: 'Monitoring, Measurement, Analysis and Evaluation',
        summary:
          'The organization must monitor, measure, analyse, and evaluate its OH&S performance. This requires defining what will be measured, how, when, and by whom — and using the data to drive improvement.',
        purpose:
          'What gets measured gets managed. Without systematic performance data, an organization cannot tell whether its OH&S MS is working.',
        requirements: [
          'Determine what needs to be monitored and measured, and the criteria for evaluation.',
          'Determine the methods to be used (lagging and leading indicators).',
          'Determine when monitoring and measurement shall be carried out.',
          'Analyse and evaluate results of monitoring and measurement.',
          'Retain documented information as evidence.',
        ],
        auditQuestions: [
          'What leading and lagging OH&S indicators does the organization track?',
          'Is there a monitoring schedule with defined frequencies and responsibilities?',
          'How is performance data analysed and communicated to management?',
        ],
        linkedModules: [
          { label: 'Reports', href: '/reports', available: false },
        ],
        children: [
          {
            id: '9.1.1',
            number: '9.1.1',
            title: 'General',
            summary:
              'The organization must establish, implement, and maintain a process to monitor, measure, analyse, and evaluate OH&S performance. The process must specify what will be measured (both leading and lagging indicators), the measurement methods, the evaluation criteria, and when results will be analysed and communicated.',
            purpose:
              'Systematic monitoring provides the data needed to understand performance trends, identify gaps, and drive targeted improvement rather than guessing.',
            requirements: [
              'Define what will be monitored and measured: include both lagging indicators (incidents, lost-time injuries, near misses) and leading indicators (safety observations, training completion, inspection findings).',
              'Define measurement methods to ensure valid and reproducible results.',
              'Define criteria for evaluating OH&S performance (targets, thresholds, legal limits).',
              'Define when and how often monitoring and measurement will be carried out.',
              'Analyse and evaluate monitoring results and communicate findings to top management and relevant workers.',
              'Calibrate or verify monitoring and measurement equipment where applicable (e.g. noise dosimeters, air quality monitors).',
              'Retain documented information as evidence of results.',
            ],
            auditQuestions: [
              'Is there a documented OH&S performance monitoring plan with defined indicators, frequencies, and responsibilities?',
              'Does the monitoring programme include leading indicators (proactive), not just lagging indicators (reactive)?',
              'Is monitoring equipment calibrated and maintained?',
              'How are performance results communicated to workers and management?',
              'What trend analysis is performed on OH&S data?',
            ],
            linkedModules: [
              { label: 'Incidents', href: '/incidents', available: true },
              { label: 'Reports', href: '/reports', available: false },
            ],
          },
          {
            id: '9.1.2',
            number: '9.1.2',
            title: 'Evaluation of Compliance',
            summary:
              'The organization must establish, implement, and maintain a process for evaluating compliance with applicable legal and other requirements. Compliance evaluations must be conducted at planned intervals, with results retained as documented information.',
            purpose:
              'Maintaining a legal register is not enough — the organization must actively verify that it is actually complying, and identify any gaps for corrective action.',
            requirements: [
              'Establish a process for periodic compliance evaluation against all applicable legal and other requirements.',
              'Conduct compliance evaluations at planned intervals.',
              'Evaluate compliance for all items in the legal and other requirements register (6.1.3).',
              'Document and retain the results of compliance evaluations.',
              'Take action on any identified non-compliance (corrective action — Clause 10.2).',
              'Maintain knowledge and understanding of the organization\'s compliance status.',
            ],
            auditQuestions: [
              'Is there a documented process and schedule for compliance evaluations?',
              'When was the most recent compliance evaluation conducted, and who performed it?',
              'What compliance gaps, if any, were identified, and what corrective actions were taken?',
              'Is the compliance evaluation process independent enough to provide objective results?',
            ],
            linkedModules: [
              { label: 'Audits', href: '/audits', available: false },
              { label: 'Reports', href: '/reports', available: false },
            ],
          },
        ],
      },
      {
        id: '9.2',
        number: '9.2',
        title: 'Internal Audit',
        summary:
          'The organization must conduct planned internal audits of the OH&S MS at planned intervals to determine whether the system conforms to requirements and is being effectively implemented and maintained. Audit findings must be reported to management and used as inputs to management review.',
        purpose:
          'Internal audits provide an independent, systematic check on whether the OH&S MS is working as designed. They are a critical verification tool before external certification audits.',
        requirements: [
          'Conduct internal audits at planned intervals.',
          'Auditors must be objective and impartial (not auditing their own work).',
          'Report audit results to relevant managers.',
          'Take timely action on nonconformities identified.',
          'Retain documented information as evidence of the audit programme and audit results.',
        ],
        auditQuestions: [
          'Is there an annual internal audit programme covering all elements of the OH&S MS?',
          'Are internal auditors trained and competent?',
          'How is auditor independence ensured?',
          'Are audit findings tracked to closure?',
        ],
        linkedModules: [
          { label: 'Audits', href: '/audits', available: false },
        ],
        children: [
          {
            id: '9.2.1',
            number: '9.2.1',
            title: 'General',
            summary:
              'The organization must conduct internal audits at planned intervals to provide information on whether the OH&S MS conforms to the organization\'s own requirements and to the requirements of ISO 45001:2018, and to determine whether it is effectively implemented and maintained.',
            purpose:
              'To ensure that internal audits answer two key questions: "Are we doing what we said we would?" and "Is what we said we would do actually working?"',
            requirements: [
              'Conduct internal OH&S MS audits at planned intervals.',
              'Audit against the organization\'s own OH&S MS requirements.',
              'Audit against the requirements of ISO 45001:2018.',
              'Determine whether the OH&S MS is effectively implemented and maintained.',
              'Provide audit results to relevant management.',
              'Retain documented information as evidence of audit results and findings.',
            ],
            auditQuestions: [
              'Does the internal audit programme cover all clauses of ISO 45001:2018?',
              'Do audit reports conclude on both conformance to the standard and effective implementation?',
              'Are audit findings used as inputs to management review (9.3)?',
            ],
            linkedModules: [
              { label: 'Audits', href: '/audits', available: false },
            ],
          },
          {
            id: '9.2.2',
            number: '9.2.2',
            title: 'Internal Audit Programme',
            summary:
              'The organization must establish, implement, and maintain an internal audit programme that defines frequency, methods, responsibilities, consultation requirements, and reporting. The programme must consider the importance of processes, risk assessment results, and results of previous audits.',
            purpose:
              'A risk-based audit programme ensures audit resources are directed at the areas of highest risk and poorest performance, rather than applying equal time to all clauses regardless of relevance.',
            requirements: [
              'Establish a documented internal audit programme specifying frequency, methods, responsibilities, planning requirements, and reporting.',
              'The audit programme must consider the importance of processes concerned, the results of risk assessments, and the results of previous audits.',
              'Define criteria and scope for each audit.',
              'Select auditors who are objective and impartial.',
              'Report audit results to relevant management.',
              'Take corrective action without undue delay on identified nonconformities.',
              'Retain documented information as evidence of the programme implementation and results.',
            ],
            auditQuestions: [
              'Is there a documented annual audit programme with scheduled dates, scope, and assigned auditors?',
              'Does the programme use a risk-based approach to allocate more audit time to higher-risk areas?',
              'Are previous audit results used to inform the focus of the current year\'s audits?',
              'What is the average time taken from audit finding to corrective action closure?',
            ],
            linkedModules: [
              { label: 'Audits', href: '/audits', available: false },
            ],
          },
        ],
      },
      {
        id: '9.3',
        number: '9.3',
        title: 'Management Review',
        summary:
          'Top management must review the organization\'s OH&S MS at planned intervals to ensure its continuing suitability, adequacy, and effectiveness. The review must consider specific inputs and produce documented outputs including decisions on opportunities for improvement and resource needs.',
        purpose:
          'Management review is the formal governance mechanism that ensures top management stays connected to OH&S system performance and drives strategic improvement decisions.',
        requirements: [
          'Top management must conduct management reviews at planned intervals.',
          'Review inputs must include: status of previous actions; changes in external/internal issues; extent to which OH&S policy and objectives have been achieved; incident, nonconformity, and corrective action information; monitoring and measurement results; compliance evaluation results; audit results; worker consultation and participation; risks and opportunities; adequacy of resources; relevant communication with interested parties.',
          'Review outputs must include: conclusions on the continuing suitability, adequacy, and effectiveness of the OH&S MS; decisions on continual improvement opportunities; any need for changes to the OH&S MS; resources required; actions to be taken if objectives not met.',
          'Retain documented information as evidence of management review results.',
          'Communicate outputs of management review to workers and their representatives.',
        ],
        auditQuestions: [
          'Are management reviews conducted at defined intervals (at minimum annually)?',
          'Are all required inputs to management review covered in the agenda and minutes?',
          'Do management review outputs include specific actions with owners and deadlines?',
          'Is there evidence that actions from previous management reviews have been followed up and closed?',
          'Are management review outcomes communicated to workers?',
          'Does top management personally attend and engage in management reviews?',
        ],
        linkedModules: [
          { label: 'Reports', href: '/reports', available: false },
          { label: 'Objectives & KPIs', href: '/objectives', available: false },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CLAUSE 10 — Improvement
  // ──────────────────────────────────────────────────────────────────────────
  {
    number: 10,
    id: '10',
    title: 'Improvement',
    overview:
      'The acting clause of the PDCA cycle. Requires the organization to learn from incidents, nonconformities, and audit findings through a structured corrective action process, and to actively drive continual improvement in OH&S performance — not just maintain the status quo.',
    isHLS: true,
    children: [
      {
        id: '10.1',
        number: '10.1',
        title: 'General',
        summary:
          'The organization must determine and select opportunities for improvement and implement necessary actions to achieve the intended outcomes of the OH&S MS. Improvement includes reactive improvement (responding to incidents), corrective improvement (addressing identified nonconformities), and proactive continual improvement.',
        purpose:
          'To make improvement a systematic, ongoing activity — not something that only happens after a serious incident.',
        requirements: [
          'Actively determine opportunities for improvement from all available sources: monitoring data, audit findings, incident investigations, worker suggestions, management reviews.',
          'Implement actions to address improvement opportunities.',
          'Evaluate the effectiveness of improvement actions.',
          'Improvement actions must be documented and tracked.',
        ],
        auditQuestions: [
          'What mechanisms exist for proactively identifying opportunities for OH&S improvement?',
          'Is there evidence of improvement actions that were initiated without a preceding incident or nonconformity?',
          'How does the organization prioritize improvement opportunities?',
        ],
        linkedModules: [
          { label: 'Corrective Actions', href: '/corrective-actions', available: false },
          { label: 'Objectives & KPIs', href: '/objectives', available: false },
        ],
      },
      {
        id: '10.2',
        number: '10.2',
        title: 'Incident, Nonconformity and Corrective Action',
        summary:
          'The organization must establish a formal process for reporting, investigating, and responding to incidents and nonconformities. The process must require root cause analysis and the implementation of corrective actions that address causes, not just symptoms. Incidents include near misses, not just injuries.',
        purpose:
          'Every incident and near miss is a signal that something in the system failed. A rigorous investigation and corrective action process turns safety events into learning that prevents recurrence.',
        requirements: [
          'Establish a process for reporting incidents and nonconformities that includes timely notification.',
          'React to incidents and nonconformities by: taking action to control and correct the situation; evaluating the need for corrective action to eliminate root causes.',
          'Conduct investigation within a suitable timeframe proportional to the severity of the event.',
          'Review existing risk assessments and other OH&S data as part of investigation.',
          'Determine root causes of incidents and nonconformities.',
          'Determine whether similar incidents or nonconformities exist or could potentially occur elsewhere.',
          'Implement corrective actions and evaluate their effectiveness.',
          'Communicate relevant findings to workers and their representatives.',
          'Consult workers in incident investigation (see 5.4).',
          'Retain documented information as evidence of incidents investigated, findings, corrective actions, and effectiveness evaluation.',
          'Report notifiable incidents to the relevant regulatory authority within the legally required timeframe.',
        ],
        auditQuestions: [
          'Is there a documented incident and nonconformity reporting and investigation procedure?',
          'Do incident investigations include root cause analysis (not just describing what happened)?',
          'Are near miss incidents reported and investigated with the same rigour as injury incidents?',
          'Is there evidence that corrective actions address root causes, not just immediate causes?',
          'How is effectiveness of corrective actions evaluated?',
          'Are incident investigation findings shared with relevant workers to prevent recurrence?',
          'Is there evidence that legal reporting obligations for notifiable incidents are met?',
          'Are workers actively involved and consulted in the investigation process?',
        ],
        linkedModules: [
          { label: 'Incidents', href: '/incidents', available: true },
          { label: 'Corrective Actions', href: '/corrective-actions', available: false },
          { label: 'Investigations', href: '/investigations', available: false },
        ],
      },
      {
        id: '10.3',
        number: '10.3',
        title: 'Continual Improvement',
        summary:
          'The organization must continually improve the suitability, adequacy, and effectiveness of the OH&S MS. Continual improvement is achieved by enhancing OH&S performance, promoting a culture that supports the OH&S MS, promoting worker participation, communicating relevant improvement results, and maintaining documented information.',
        purpose:
          'ISO 45001:2018 is not a static certification — it requires organizations to keep getting better. Continual improvement distinguishes a living, effective system from a compliance trophy.',
        requirements: [
          'Continually improve the suitability, adequacy, and effectiveness of the OH&S MS.',
          'Enhance OH&S performance through implementing planned processes and actions (Clause 6) and reviewing their effectiveness.',
          'Promote a culture that supports the OH&S MS — where workers feel safe to report hazards and participate in improvement.',
          'Promote worker consultation and participation in identifying and implementing improvements (5.4).',
          'Communicate relevant continual improvement results to workers and their representatives.',
          'Retain documented information as evidence of continual improvement.',
        ],
        auditQuestions: [
          'Can the organization demonstrate a measurable trend of improving OH&S performance over time?',
          'What specific improvements to the OH&S MS have been made in the last 12 months?',
          'How does the organization create a culture where workers feel safe to report hazards without fear?',
          'Are continual improvement results shared with workers?',
          'Is there evidence that management review outputs (9.3) have led to system improvements?',
        ],
        linkedModules: [
          { label: 'Objectives & KPIs', href: '/objectives', available: false },
          { label: 'Reports', href: '/reports', available: false },
          { label: 'Incidents', href: '/incidents', available: true },
        ],
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Flatten all navigable clause items (including nested children) into a single array */
export function flattenClauses(clauses: TopClause[]): ClauseItem[] {
  const result: ClauseItem[] = [];

  function flatten(items: ClauseItem[]) {
    for (const item of items) {
      result.push(item);
      if (item.children?.length) flatten(item.children);
    }
  }

  for (const clause of clauses) {
    // Top-level clause (1, 2, 3...) maps to its first (and only) child when it has no children array on children
    flatten(clause.children);
  }

  return result;
}

/** Find a clause item by its id, searching recursively */
export function findClauseById(id: string): ClauseItem | null {
  for (const topClause of ISO_45001) {
    const found = searchChildren(topClause.children, id);
    if (found) return found;
  }
  return null;
}

function searchChildren(items: ClauseItem[], id: string): ClauseItem | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children?.length) {
      const found = searchChildren(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

/** Get the parent TopClause for a given clause id */
export function getTopClause(clauseId: string): TopClause | null {
  const topNum = clauseId.split('.')[0];
  return ISO_45001.find((c) => String(c.number) === topNum) ?? null;
}
