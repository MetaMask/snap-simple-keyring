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
    {
      // See: <https://www.gatsbyjs.com/plugins/gatsby-plugin-webfonts/>
      resolve: `gatsby-plugin-webfonts`,
      options: {
        fonts: {
          google: [
            {
              family: 'Roboto Mono',
              variants: ['400'],
            },
          ],
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
          ],
        },
      },
    },
  ],
};

export default config;
