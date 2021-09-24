/******************************************************************************
**	@Author:				The Ape Community
**	@Twitter:				@ape_tax
**	@Date:					Wednesday August 11th 2021
**	@Filename:				next.config.js
******************************************************************************/

const Dotenv = require('dotenv-webpack');

module.exports = ({
	plugins: [
		new Dotenv()
	],
	env: {
		FMT_KEY: process.env.FMT_KEY,
		WEBSITE_URI: process.env.WEBSITE_URI || 'https://adventure.major.tax/',
		RARITY_ADDR: '0x4fb729BDb96d735692DCACD9640cF7e3aA859B25',	// Polygon
		//RARITY_ADDR: '0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb',
		RARITY_ATTR_ADDR: '0x3a7c6a0e65480eb32a0ddf1cc2db6563aaed03ce',	// Polygon
		//RARITY_ATTR_ADDR: '0xb5f5af1087a8da62a23b08c00c6ec9af21f397a1',
		RARITY_GOLD_ADDR: '0x7303E7a860DAFfE4d0b33615479648cb3496903b',	// Polygon
		//RARITY_GOLD_ADDR: '0x2069B76Afe6b734Fb65D1d099E7ec64ee9CC76B2',
		RARITY_SKILLS_ADDR: '0xf740103f4eDB85609292472048Dc823b5417D9a6',	// Polygon
		//RARITY_SKILLS_ADDR: '0x51C0B29A1d84611373BA301706c6B4b72283C80F',

		DUNGEON_THE_CELLAR_ADDR: '0x2A0F1cB17680161cF255348dDFDeE94ea8Ca196A',
		DUNGEON_THE_FOREST_ADDR: '0x9e894cd5dCC5Bad1eD3663077871d9D010f654b5',
		DUNGEON_THE_FOREST_V1_ADDR: '0xb37d3d79ea86B0334d9322c695339D577A3D57be',

		ZAP_VAULT_ADDR: '0xfCE6CbeF3867102da383465cc237B49fF4B9d48F',
		FTM_VAULT_ADDR: '0x0dec85e74a92c52b7f708c4b10207d9560cefaf0',

		CHAIN_ID: 137, // 137 = Polygon, the old system used 250 for FTM
		NETWORK_API_URL: 'https://api.polygonscan.com',	// Used to be https://api.ftmscan.com for FTM
	},
	optimization: {
		minimize: true,
		splitChunks: {
			chunks: 'all',
			maxInitialRequests: 25,
			minSize: 20000
		}
	},
	webpack: (config, {webpack}) => {
		config.plugins.push(new webpack.IgnorePlugin(/\/__tests__\//));
		return config;
	},
	webpackDevMiddleware: (config) => {
		// Perform customizations to webpack dev middleware config
		// Important: return the modified config
		return config;
	},
});
