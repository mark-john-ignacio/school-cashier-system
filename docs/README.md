# School Cashier System Documentation# Website

This directory contains the complete documentation for the School Cashier System, built with [Docusaurus](https://docusaurus.io/).This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## 📚 Documentation Structure## Installation

`````bash

docs/yarn

├── architecture/     # System architecture and design patterns```

├── developer/        # Developer guides and references

├── implementation/   # Implementation progress and roadmaps## Local Development

├── workflow/         # Workflow guides and procedures

└── features/         # Feature documentation and enhancements```bash

```yarn start

```

## 🚀 Quick Start

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Prerequisites

## Build

- Node.js 18.0 or above

- npm or yarn```bash

yarn build

### Installation```



Dependencies are already installed when you ran `npx create-docusaurus@latest`. If you need to reinstall:This command generates static content into the `build` directory and can be served using any static contents hosting service.



```powershell## Deployment

cd docs

npm installUsing SSH:

```

```bash

### DevelopmentUSE_SSH=true yarn deploy

```

Start the development server (runs on http://localhost:3000):

Not using SSH:

```powershell

# From the docs directory```bash

npm startGIT_USER=<Your GitHub username> yarn deploy

```

# Or from the root directory

npm run docs:devIf you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

```

The site will automatically reload when you make changes to documentation files.

### Build

Generate static content into the `build` directory:

```powershell
# From the docs directory
npm run build

# Or from the root directory
npm run docs:build
```

### Serve (Preview Production Build)

Serve the production build locally:

```powershell
# From the docs directory
npm run serve

# Or from the root directory
npm run docs:serve
```

## ✏️ Writing Documentation

### Adding a New Page

1. Create a new markdown file in the appropriate category folder under `docs/docs/`:
   ```
   docs/docs/features/my-new-feature.md
   ```

2. Add front matter to the file:
   ```markdown
   ---
   sidebar_position: 3
   title: My New Feature
   ---

   # My New Feature

   Your content here...
   ```

3. The page will automatically appear in the sidebar based on the folder structure.

### Updating the Sidebar

Edit `sidebars.ts` to customize the sidebar navigation:

```typescript
{
  type: 'category',
  label: 'Features',
  items: [
    'features/dashboard-enhancement',
    'features/my-new-feature', // Add your new page
  ],
}
```

## 🎨 Customization

### Site Configuration

Edit `docusaurus.config.ts` to customize:
- Site title and tagline
- Navbar items
- Footer links
- Theme colors
- Meta tags

### Styling

- Custom CSS: Edit `src/css/custom.css`
- React components: Modify files in `src/components/`
- Pages: Add custom pages in `src/pages/`

## 📖 Markdown Features

Docusaurus supports extended markdown features:

### Admonitions

```markdown
:::tip
This is a helpful tip!
:::

:::warning
This is a warning!
:::

:::danger
This is dangerous!
:::
```

### Code Blocks with Syntax Highlighting

````markdown
```typescript title="example.ts"
const greeting: string = "Hello, World!";
```
````

### Tabs

```markdown
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="npm" label="npm">
    npm install package
  </TabItem>
  <TabItem value="yarn" label="Yarn">
    yarn add package
  </TabItem>
</Tabs>
```

## 🚢 Deployment

### Build for Production

```powershell
npm run build
```

The static files will be generated in the `build` directory.

### Deployment Options

1. **GitHub Pages**: Use the built-in deployment command:
   ```powershell
   GIT_USER=<Your GitHub username> npm run deploy
   ```

2. **Netlify**: Connect your repository and set:
   - Build command: `cd docs && npm run build`
   - Publish directory: `docs/build`

3. **Vercel**: Similar to Netlify with the same settings

4. **Manual**: Upload the `build` directory to any static hosting service

## 📝 Documentation Guidelines

1. **Use clear titles**: Make titles descriptive and searchable
2. **Add metadata**: Include `sidebar_position` and `title` in front matter
3. **Link related docs**: Use relative links to connect related documentation
4. **Keep it updated**: Update docs when code changes
5. **Use examples**: Include code examples and screenshots where helpful
6. **Be consistent**: Follow the existing structure and style

## 🔗 Useful Links

- [Docusaurus Documentation](https://docusaurus.io/docs)
- [Markdown Guide](https://docusaurus.io/docs/markdown-features)
- [Styling and Layout](https://docusaurus.io/docs/styling-layout)
- [Deployment](https://docusaurus.io/docs/deployment)

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is already in use:
```powershell
npm start -- --port 3001
```

### Build Errors

Clear the cache and rebuild:
```powershell
npm run clear
npm run build
```

### Broken Links

Check for broken links before deploying:
```powershell
npm run build
```

Docusaurus will warn about broken links during the build process.

---

For questions or issues, please refer to the main project documentation or create an issue in the repository.
`````
