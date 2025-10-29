# Label-X Website


## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/enuda-labs/label-x-website.git
cd label-x-website
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env` file in the root directory and add the following variables:

```env
# Client Configuration
NEXT_PUBLIC_BASE_API_URL=


# CLOUDINARY CONFIGURATION
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Features

- Admin account on route ('/app/(dashboard)/(admin))
- Labeler account on route ('/app/(dashboard)/(labelers))
- Client account on route ('/app/(dashboard)/(clients)/)
