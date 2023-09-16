/* eslint-disable @typescript-eslint/naming-convention */
import type { GatsbyConfig } from 'gatsby';

const config: GatsbyConfig = {
  // This is required to make use of the React 17+ JSX transform.
  jsxRuntime: 'automatic',

  pathPrefix: process.env.GATSBY_PATH_PREFIX ?? '/',

  plugins: [
    'gatsby-plugin-svgr',
    'gatsby-plugin-styled-components',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'Template Snap',
        icon: 'src/assets/logo.svg',
        theme_color: '#6F4CFF',
        background_color: '#FFFFFF',
        display: 'standalone',
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      // See: <https://www.gatsbyjs.com/plugins/gatsby-plugin-webfonts/>
      resolve: `gatsby-plugin-webfonts`,
      options: {
        fonts: {
          selfHosted: [
            // Common weight name mapping
            //
            // 100 - Thin (Hairline)
            // 200 - Extra Light (Ultra Light)
            // 300 - Light
            // 400 - Normal (Regular)
            // 500 - Medium
            // 600 - Semi Bold (Demi Bold)
            // 700 - Bold
            // 800 - Extra Bold (Ultra Bold)
            // 900 - Black (Heavy)
            // 950 - Extra Black (Ultra Black)
            //
            // See: <https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight#common_weight_name_mapping>

            // ----------------------------------------------------------------
            // Light
            {
              family: 'Euclid Circular B',
              urls: {
                woff2: `fonts/EuclidCircularB-Light.woff2`,
                woff: `fonts/EuclidCircularB-Light.woff`,
                ttf: `fonts/Euclid Circular B Light.ttf`,
              },
              fontStyle: 'normal',
              fontWeight: 300,
            },
            {
              family: 'Euclid Circular B',
              urls: {
                woff2: `fonts/EuclidCircularB-LightItalic.woff2`,
                woff: `fonts/EuclidCircularB-LightItalic.woff`,
                ttf: `fonts/Euclid Circular B Light Italic.ttf`,
              },
              fontStyle: 'italic',
              fontWeight: 300,
            },

            // ----------------------------------------------------------------
            // Regular
            {
              family: 'Euclid Circular B',
              urls: {
                woff2: `fonts/EuclidCircularB-Regular.woff2`,
                woff: `fonts/EuclidCircularB-Regular.woff`,
                ttf: `fonts/Euclid Circular B Regular.ttf`,
              },
              fontStyle: 'normal',
              fontWeight: 400,
            },
            {
              family: 'Euclid Circular B',
              urls: {
                woff2: `fonts/EuclidCircularB-Italic.woff2`,
                woff: `fonts/EuclidCircularB-Italic.woff`,
                ttf: `fonts/Euclid Circular B Italic.ttf`,
              },
              fontStyle: 'italic',
              fontWeight: 400,
            },

            // ----------------------------------------------------------------
            // Medium
            {
              family: 'Euclid Circular B',
              urls: {
                woff2: `fonts/EuclidCircularB-Medium.woff2`,
                woff: `fonts/EuclidCircularB-Medium.woff`,
                ttf: `fonts/Euclid Circular B Medium.ttf`,
              },
              fontStyle: 'normal',
              fontWeight: 500,
            },
            {
              family: 'Euclid Circular B',
              urls: {
                woff2: `fonts/EuclidCircularB-MediumItalic.woff2`,
                woff: `fonts/EuclidCircularB-MediumItalic.woff`,
                ttf: `fonts/Euclid Circular B MediumItalic.ttf`,
              },
              fontStyle: 'italic',
              fontWeight: 500,
            },

            // ----------------------------------------------------------------
            // Semi bold
            {
              family: 'Euclid Circular B',
              urls: {
                woff2: `fonts/EuclidCircularB-SemiBold.woff2`,
                woff: `fonts/EuclidCircularB-SemiBold.woff`,
                ttf: `fonts/Euclid Circular B SemiBold.ttf`,
              },
              fontStyle: 'normal',
              fontWeight: 600,
            },
            {
              family: 'Euclid Circular B',
              urls: {
                woff2: `fonts/EuclidCircularB-SemiBoldItalic.woff2`,
                woff: `fonts/EuclidCircularB-SemiBoldItalic.woff`,
                ttf: `fonts/Euclid Circular B SemiBold Italic.ttf`,
              },
              fontStyle: 'italic',
              fontWeight: 600,
            },

            // ----------------------------------------------------------------
            // Bold
            {
              family: 'Euclid Circular B',
              urls: {
                woff2: `fonts/EuclidCircularB-Bold.woff2`,
                woff: `fonts/EuclidCircularB-Bold.woff`,
                ttf: `fonts/Euclid Circular B Bold.ttf`,
              },
              fontStyle: 'normal',
              fontWeight: 700,
            },
            {
              family: 'Euclid Circular B',
              urls: {
                woff2: `fonts/EuclidCircularB-BoldItalic.woff2`,
                woff: `fonts/EuclidCircularB-BoldItalic.woff`,
                ttf: `fonts/Euclid Circular B Bold Italic.ttf`,
              },
              fontStyle: 'italic',
              fontWeight: 700,
            },
          ],
        },
      },
    },
  ],
};

export default config;
