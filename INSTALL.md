# Installation Guide

## Quick Install

### Option 1: Using the shell script
```bash
./install.sh
```

### Option 2: Using npm script
```bash
npm run install-deps
```

### Option 3: Direct installation
```bash
npm install
```

## What gets installed

The following dependencies will be installed:

### UI Components (Radix UI)
- `@radix-ui/react-slot` - For component composition
- `@radix-ui/react-dialog` - For modal dialogs
- `@radix-ui/react-select` - For select dropdowns
- `@radix-ui/react-label` - For form labels
- `@radix-ui/react-popover` - For popover components

### Utility Libraries
- `class-variance-authority` - For component variants
- `clsx` - For conditional className handling
- `tailwind-merge` - For merging Tailwind CSS classes

## After Installation

Once all dependencies are installed, you can:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Start production server:**
   ```bash
   npm run start
   ```

## Troubleshooting

If you encounter any issues:

1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. If the problem persists, try clearing npm cache: `npm cache clean --force`

## Development

The project uses:
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Radix UI components
- Wagmi for Web3 interactions
