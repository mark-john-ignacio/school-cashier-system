import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Architecture',
      collapsed: false,
      items: [
        'architecture/guide',
      ],
    },
    {
      type: 'category',
      label: 'Developer Guide',
      collapsed: false,
      items: [
        'developer/quick-reference',
        'developer/experience-summary',
        'developer/contributing',
      ],
    },
    {
      type: 'category',
      label: 'Implementation',
      collapsed: true,
      items: [
        'implementation/progress',
        'implementation/roadmap',
        'implementation/refactoring-roadmap',
        'implementation/project-status',
      ],
    },
    {
      type: 'category',
      label: 'Workflow',
      collapsed: true,
      items: [
        'workflow/system-workflow',
        'workflow/quick-guide',
        'workflow/quick-reference',
        'workflow/payment-refactoring',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      collapsed: true,
      items: [
        'features/dashboard-enhancement',
        'features/welcome-page-enhancement',
      ],
    },
  ],
};

export default sidebars;
