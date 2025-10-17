import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'School Cashier System',
  tagline: 'Modern Payment Management for Educational Institutions',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://mark-john-ignacio.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/school-cashier-system/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'mark-john-ignacio', // Usually your GitHub org/user name.
  projectName: 'school-cashier-system', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/mark-john-ignacio/school-cashier-system/tree/master/docs/',
        },
        blog: false, // Disable blog feature
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'School Cashier System',
      logo: {
        alt: 'School Cashier System Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/mark-john-ignacio/school-cashier-system',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/intro',
            },
            {
              label: 'Architecture',
              to: '/docs/architecture/guide',
            },
            {
              label: 'Developer Guide',
              to: '/docs/developer/quick-reference',
            },
          ],
        },
        {
          title: 'Project',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/mark-john-ignacio/school-cashier-system',
            },
            {
              label: 'Issues',
              href: 'https://github.com/mark-john-ignacio/school-cashier-system/issues',
            },
          ],
        },
        {
          title: 'Tech Stack',
          items: [
            {
              label: 'Laravel 12',
              href: 'https://laravel.com',
            },
            {
              label: 'React 19',
              href: 'https://react.dev',
            },
            {
              label: 'Inertia.js',
              href: 'https://inertiajs.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} School Cashier System. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
