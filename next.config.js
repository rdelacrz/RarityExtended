/******************************************************************************
**	@Author:				The Ape Community
**	@Twitter:				@ape_tax
**	@Date:					Wednesday August 11th 2021
**	@Filename:				next.config.js
******************************************************************************/

const Dotenv = require('dotenv-webpack');

const networkVars = {
	ftm: {
		NETWORK_NAME: 'Fantom',
		NETWORK_KEY: process.env.FMT_KEY,
		CHAIN_ID: 250,
		NETWORK_API_URL: 'https://api.ftmscan.com/api',
		ADD_ETH_CHAIN_PARAM: JSON.stringify({
			'chainId': '0xFA',
			'blockExplorerUrls': ['https://ftmscan.com'],
			'chainName': 'Fantom Opera',
			'rpcUrls': ['https://rpc.ftm.tools'],
			'nativeCurrency': {
				'name': 'Fantom',
				'symbol': 'FTM',
				'decimals': 18
			}
		}),

		// Contracts
		RARITY_ADDR: '0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb',
		RARITY_ATTR_ADDR: '0xb5f5af1087a8da62a23b08c00c6ec9af21f397a1',
		RARITY_GOLD_ADDR: '0x2069B76Afe6b734Fb65D1d099E7ec64ee9CC76B2',
		RARITY_SKILLS_ADDR: '0x51C0B29A1d84611373BA301706c6B4b72283C80F',
		
		RARITY_CRAFTING_ADDR: '0xf41270836dF4Db1D28F7fd0935270e3A603e78cC',
		RARITY_CRAFTING_HELPER_ADDR: '0xf3a69301d1492493eB50c330aEE58402C4bcfA1D',

		// Dungeon
		DUNGEON_THE_CELLAR_ADDR: '0x2A0F1cB17680161cF255348dDFDeE94ea8Ca196A',
		DUNGEON_THE_FOREST_ADDR: '0x9e894cd5dCC5Bad1eD3663077871d9D010f654b5',
		DUNGEON_THE_FOREST_V1_ADDR: '0xb37d3d79ea86B0334d9322c695339D577A3D57be',
	},
	polygon: {
		NETWORK_NAME: 'Polygon',
		NETWORK_KEY: 'DTV5YPK2WGU2HNC9P3XEKFF6ZYQZPVPRAP', //process.env.POLYGON_KEY,
		CHAIN_ID: 137,
		NETWORK_API_URL: 'https://api.polygonscan.com/api',
		MULTICALL2_ADDRESS: '0x557fD25F9169247000F9D866704b4Bc12680CE5f',

		ADD_ETH_CHAIN_PARAM: JSON.stringify({
			'chainId': '0x89',
			'blockExplorerUrls': ['https://polygonscan.com/'],
			'chainName': 'Polygon',
			'rpcUrls': ['https://rpc-mainnet.matic.network'],
			'nativeCurrency': {
				'name': 'Polygon',
				'symbol': 'MATIC',
				'decimals': 18
			}
		}),

		// Contracts
		RARITY_ADDR: '0x4fb729BDb96d735692DCACD9640cF7e3aA859B25',
		RARITY_ATTR_ADDR: '0x3a7c6a0e65480eb32a0ddf1cc2db6563aaed03ce',
		RARITY_GOLD_ADDR: '0x7303E7a860DAFfE4d0b33615479648cb3496903b',
		RARITY_SKILLS_ADDR: '0xf740103f4eDB85609292472048Dc823b5417D9a6',
		
		RARITY_CRAFTING_ADDR: '0x7d022B9b34eaDC5E7507823EDe459347220EdA5D',

		// Dungeon
		DUNGEON_THE_CELLAR_ADDR: '0xEF4C8E18c831cB7C937A0D17809102208570eC8F',
	},
}

module.exports = ({
	plugins: [
		new Dotenv()
	],
	env: {
		...networkVars[process.env.NETWORK],

		NETWORK: process.env.NETWORK,
		WEBSITE_URI: process.env.WEBSITE_URI || 'https://adventure.major.tax/',
		
		RARITY_CRAFTING_ID: '1758709',

		ZAP_VAULT_ADDR: '0xfCE6CbeF3867102da383465cc237B49fF4B9d48F',
		FTM_VAULT_ADDR: '0x0dec85e74a92c52b7f708c4b10207d9560cefaf0',

		DAI_VAULT_ADDR: '0x637eC617c86D24E421328e6CAEa1d92114892439',
		DAI_TOKEN_ADDR: '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E',
		WFTM_TOKEN_ADDR: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
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
