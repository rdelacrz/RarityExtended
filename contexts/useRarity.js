/******************************************************************************
**	@Author:				Rarity Extended
**	@Twitter:				@RXtended
**	@Date:					Sunday September 5th 2021
**	@Filename:				useRarity.js
******************************************************************************/
/* eslint-disable react-hooks/exhaustive-deps */

import	React, {useState, useEffect, useContext, createContext}	from	'react';
import	useWeb3													from	'contexts/useWeb3';
import	{ethers}												from	'ethers';
import	{Provider, Contract}									from	'ethcall';
import	useSWR													from	'swr';
import	ModalCurrentAdventurer									from	'components/ModalCurrentAdventurer';
import	{chunk, fetcher, toAddress}								from	'utils';
import	ITEMS													from	'utils/codex/items';
import	RARITY_ABI												from	'utils/abi/rarity.abi';
import	RARITY_ATTR_ABI											from	'utils/abi/rarityAttr.abi';
import	RARITY_GOLD_ABI											from	'utils/abi/rarityGold.abi';
import	RARITY_SKILLS_ABI										from	'utils/abi/raritySkills.abi';
import	RARITY_LIBRARY_ABI										from	'utils/abi/rarityLibrary.abi';
import	RARITY_CRAFTING_HELPER_ABI								from	'utils/abi/rarityCraftingHelper.abi';
import	THE_CELLAR_ABI											from	'utils/abi/dungeonTheCellar.abi';
import	THE_FOREST_ABI											from	'utils/abi/dungeonTheForest.abi';

import	MANIFEST_GOODS											from	'utils/codex/items_manifest_goods.json';
import	MANIFEST_ARMORS											from	'utils/codex/items_manifest_armors.json';
import	MANIFEST_WEAPONS										from	'utils/codex/items_manifest_weapons.json';

import { dungeonTypes, isDungeonAvailable, numberOfDungeonsAvailable } from 'utils/scarcity-functions';

const	RarityContext = createContext();
let		isUpdatingRarities = false;

async function newEthCallProvider(provider, devMode) {
	const	ethcallProvider = new Provider();
	if (devMode) {
		await	ethcallProvider.init(new ethers.providers.JsonRpcProvider('http://localhost:8545'));
		ethcallProvider.multicallAddress = process.env.MULTICALL_ADDRESS;
		ethcallProvider.multicall2Address = process.env.MULTICALL2_ADDRESS;
		return ethcallProvider;
	}
	await	ethcallProvider.init(provider);
	return	ethcallProvider;
}

export const RarityContextApp = ({children}) => {
	const	{active, address, chainID, provider} = useWeb3();
	const	getRaritiesRequestURI = `
		${process.env.NETWORK_API_URL}
		?module=account
		&action=tokennfttx
		&contractaddress=${process.env.RARITY_ADDR}
		&address=${address}
		&apikey=${process.env.NETWORK_KEY}`;
	const	{data} = useSWR(active && address ? getRaritiesRequestURI : null, fetcher);

	const	[currentAdventurer, set_currentAdventurer] = useState(null);
	const	[rarities, set_rarities] = useState({});
	const	[inventory, set_inventory] = useState({});
	const	[rNonce, set_rNonce] = useState(0);
	const	[loaded, set_loaded] = useState(false);
	const	[isModalOpen, set_isModalOpen] = useState(false);

	/**************************************************************************
	**	Reset the rarities when the chain changes, when the address changes or
	**	when the web3 become inactive.
	**************************************************************************/
	useEffect(() => {
		set_rarities({});
		set_currentAdventurer(null);
		set_rNonce(n => n + 1);
		if (active && provider && address) {
			set_loaded(false);
			fetchRarity();
		}
	}, [active, address, chainID, provider]);

	async function	sharedCalls() {
		const ethcallProvider = await newEthCallProvider(provider, Number(chainID) === 1337);
		let	callResult;

		if (process.env.RARITY_CRAFTING_HELPER_ADDR) {
			const	rarityCraftingHelper = new Contract(process.env.RARITY_CRAFTING_HELPER_ADDR, RARITY_CRAFTING_HELPER_ABI);
			callResult = await ethcallProvider.all([
				rarityCraftingHelper.getItemsByAddress(address)
			]);
		} else {
			const	rarityLibrary = new Contract(process.env.RARITY_LIBRARY_ADDR, RARITY_LIBRARY_ABI);
			callResult = await ethcallProvider.all([
				rarityLibrary.items1(address)
			]);
		}
		
		return (callResult);
	}

	function	prepareSharedInventory(result) {
		result.forEach((item) => {
			if (item.base_type === 3) {
				set_inventory((prev) => ({...prev, [item.item_id]: {
					crafter: item.crafter.toString(),
					...Object.values(MANIFEST_WEAPONS).find(e => e.id === item.item_type),
				}}));
			}
			if (item.base_type === 2) {
				set_inventory((prev) => ({...prev, [item.item_id]: {
					crafter: item.crafter.toString(),
					...Object.values(MANIFEST_ARMORS).find(e => e.id === item.item_type),
				}}));
			}
			if (item.base_type === 1) {
				set_inventory((prev) => ({...prev, [item.item_id]: {
					crafter: item.crafter.toString(),
					...Object.values(MANIFEST_GOODS).find(e => e.id === item.item_type),
				}}));
			}
		});

	}

	/**************************************************************************
	**	Prepare the multicall to get most of the data
	**************************************************************************/
	function		prepareAdventurer(tokenID) {
		const	rarity = new Contract(process.env.RARITY_ADDR, RARITY_ABI);
		const	rarityAttr = new Contract(process.env.RARITY_ATTR_ADDR, RARITY_ATTR_ABI);
		const	rarityGold = new Contract(process.env.RARITY_GOLD_ADDR, RARITY_GOLD_ABI);
		const	raritySkills = new Contract(process.env.RARITY_SKILLS_ADDR, RARITY_SKILLS_ABI);
		// const	rarityCrafting = new Contract(process.env.RARITY_CRAFTING_ADDR, RARITY_CRAFTING_ABI);
		const	rarityDungeonCellar = new Contract(process.env.DUNGEON_THE_CELLAR_ADDR, THE_CELLAR_ABI);
		const	rarityDungeonForest = new Contract(process.env.DUNGEON_THE_FOREST_ADDR, THE_FOREST_ABI);
		// const	rarityCraftingHelper = new Contract(process.env.RARITY_CRAFTING_HELPER_ADDR, RARITY_CRAFTING_HELPER_ABI);
		// RARITY_CRAFTING_HELPER_ADDR

		return [
			rarity.ownerOf(tokenID),
			rarity.summoner(tokenID),
			rarityAttr.character_created(tokenID),
			rarityAttr.ability_scores(tokenID),
			rarityGold.balanceOf(tokenID),
			raritySkills.get_skills(tokenID),
			isDungeonAvailable(dungeonTypes.CELLAR) && rarityDungeonCellar.adventurers_log(tokenID),
			isDungeonAvailable(dungeonTypes.FOREST) && rarityDungeonForest.getResearchBySummoner(tokenID),
		].filter(x => Boolean(x));
	}
	/**************************************************************************
	**	Fetch the data from the prepared multicall to get most of the data
	**************************************************************************/
	async function	fetchAdventurer(calls) {
		const	ethcallProvider = await newEthCallProvider(provider, Number(chainID) === 1337);
		const	callResult = await ethcallProvider.all(calls);
		return (callResult);
	}

	/**************************************************************************
	**	Prepare the multicall to get most of the data
	**************************************************************************/
	function		prepareAdventurerInventory(tokenID) {
		return ITEMS.map(item => item.fetch(tokenID));
	}

	/**************************************************************************
	**	Fetch all the items for the adventurer.
	**************************************************************************/
	async function	fetchAdventurerInventory(calls) {
		if (Number(chainID) === 1337) {
			const	ethcallProvider = await newEthCallProvider(new ethers.providers.JsonRpcProvider('http://localhost:8545'));
			ethcallProvider.multicallAddress = process.env.MULTICALL_ADDRESS;
			const	callResult = await ethcallProvider.all(calls);
			return (callResult);
		} else {
			const	ethcallProvider = await newEthCallProvider(provider);
			const	callResult = await ethcallProvider.all(calls);
			return (callResult);
		}
	}

	/**************************************************************************
	**	Prepare some extra data that can not be fetched with a multicall
	**	because of the msg.sender limitation
	**************************************************************************/
	function		prepareAdventurerExtra(tokenID) {
		const	rarityGold = new ethers.Contract(process.env.RARITY_GOLD_ADDR, RARITY_GOLD_ABI, provider).connect(provider.getSigner());
		return [
			rarityGold.claimable(tokenID)
		];
	}
	/**************************************************************************
	**	Fetch the data from the prepared extra call
	**************************************************************************/
	async function	fetchAdventurerExtra(calls) {
		const	results = await Promise.all(calls.map(p => p.catch(() => ethers.BigNumber.from(0))));
		return	results.map(result => (result instanceof Error) ? undefined : result);
	}

	/**************************************************************************
	**	Actually update the state based on the data fetched
	**************************************************************************/
	function		setRarity(tokenID, multicallResult, callResult, inventoryCallResult) {
		const	[owner, adventurer, initialAttributes, abilityScores, balanceOfGold, skills] = multicallResult.slice(0, 6);
		const	[claimableGold] = callResult;

		// Sets up dungeons based on available ones (the order that dungeons are checked here is important!)
		const dungeonResults = multicallResult.slice(6);
		const dungeons = {};
		if (isDungeonAvailable(dungeonTypes.CELLAR)) {
			const cellarLog = dungeonResults.shift();
			dungeons.cellar = Number(cellarLog);
		}
		if (isDungeonAvailable(dungeonTypes.FOREST)) {
			const forestResearch = dungeonResults.shift();
			dungeons.forest = {
				initBlockTs: forestResearch.initBlockTs,
				endBlockTs: forestResearch.endBlockTs,
				canAdventure: forestResearch?.discovered === true || Number(forestResearch?.timeInDays) === 0
			}
		}

		if (toAddress(owner) !== toAddress(address)) {
			return;
		}
		if (!currentAdventurer || (currentAdventurer && tokenID === currentAdventurer.tokenID)) {
			set_currentAdventurer(p => (!p || (p && tokenID === p.tokenID)) ? {
				tokenID: tokenID,
				owner: owner,
				xp: ethers.utils.formatEther(adventurer['_xp']),
				class: Number(adventurer['_class']),
				level: Number(adventurer['_level']),
				log: Number(adventurer['_log']),
				gold: {
					balance: ethers.utils.formatEther(balanceOfGold),
					claimable: claimableGold ? ethers.utils.formatEther(claimableGold) : '0'
				},
				attributes: {
					isInit: initialAttributes,
					remainingPoints: initialAttributes ? -1 : 32,
					strength: initialAttributes ? abilityScores['strength'] : 8,
					dexterity: initialAttributes ? abilityScores['dexterity'] : 8,
					constitution: initialAttributes ? abilityScores['constitution'] : 8,
					intelligence: initialAttributes ? abilityScores['intelligence'] : 8,
					wisdom: initialAttributes ? abilityScores['wisdom'] : 8,
					charisma: initialAttributes ? abilityScores['charisma'] : 8,
				},
				skills: skills,
				dungeons,
				inventory: inventoryCallResult
			} : p);
		}
		set_rarities((prev) => ({...prev, [tokenID]: {
			tokenID: tokenID,
			owner: owner,
			xp: ethers.utils.formatEther(adventurer['_xp']),
			class: Number(adventurer['_class']),
			level: Number(adventurer['_level']),
			log: Number(adventurer['_log']),
			gold: {
				balance: ethers.utils.formatEther(balanceOfGold),
				claimable: claimableGold ? ethers.utils.formatEther(claimableGold) : '0'
			},
			attributes: {
				isInit: initialAttributes,
				remainingPoints: initialAttributes ? -1 : 32,
				strength: initialAttributes ? abilityScores['strength'] : 8,
				dexterity: initialAttributes ? abilityScores['dexterity'] : 8,
				constitution: initialAttributes ? abilityScores['constitution'] : 8,
				intelligence: initialAttributes ? abilityScores['intelligence'] : 8,
				wisdom: initialAttributes ? abilityScores['wisdom'] : 8,
				charisma: initialAttributes ? abilityScores['charisma'] : 8,
			},
			skills: skills,
			dungeons,
			inventory: inventoryCallResult
		}}));
		set_rNonce(prev => prev + 1);
	}

	/**************************************************************************
	**	Prepare the rarities update from ftmscan result
	**************************************************************************/
	async function	updateRarities(elements) {
		if (isUpdatingRarities) {
			return;
		}
		isUpdatingRarities = true;
		const	preparedCalls = [];
		const	preparedExtraCalls = [];
		const	preparedInventoryCalls = [];
		const	tokensIDs = [];

		let		uniqueElements = [];
		for (let i = 0; i < elements.length; i++) {
			const	element = elements[i];
			if (toAddress(element.to) !== toAddress(address)) {
				uniqueElements = uniqueElements.filter(e => e.tokenID !== element.tokenID);
			} else {
				uniqueElements.push(element);
			}
		}

		// In case elements from query is not an array, try-catch prevents the application from breaking
		try {
			uniqueElements?.forEach((token) => {
				preparedCalls.push(...prepareAdventurer(token.tokenID));
				preparedExtraCalls.push(...prepareAdventurerExtra(token.tokenID));
				preparedInventoryCalls.push(...prepareAdventurerInventory(token.tokenID));
				tokensIDs.push(token.tokenID);
			});
		} catch(e) {
			console.error(elements);		// Error message expected
		}

		const	callResults = await fetchAdventurer(preparedCalls);
		const	chunkedCallResult = chunk(callResults, 6 + numberOfDungeonsAvailable);
		const	extraCallResults = await fetchAdventurerExtra(preparedExtraCalls);
		const	chunkedExtraCallResult = chunk(extraCallResults, 1);
		const	inventoryCallResult = await fetchAdventurerInventory(preparedInventoryCalls);
		const	chunkedinventoryCallResult = chunk(inventoryCallResult, ITEMS.length);
		tokensIDs?.forEach((tokenID, i) => {
			setRarity(tokenID, chunkedCallResult[i], chunkedExtraCallResult[i], chunkedinventoryCallResult[i]);
		});
		sharedCalls().then(result => prepareSharedInventory(result[0]));


		set_loaded(true);
		isUpdatingRarities = false;
	}

	/**************************************************************************
	**	Prepare the rarities update from in-app update
	**************************************************************************/
	async function	updateRarity(tokenID) {
		const	callResults = await fetchAdventurer(prepareAdventurer(tokenID));
		const	chunkedCallResult = chunk(callResults, 6 + numberOfDungeonsAvailable);
		const	extraCallResults = await fetchAdventurerExtra(prepareAdventurerExtra(tokenID));
		const	chunkedExtraCallResult = chunk(extraCallResults, 1);
		const	inventoryCallResult = await fetchAdventurerInventory(prepareAdventurerInventory(tokenID));
		const	chunkedinventoryCallResult = chunk(inventoryCallResult, ITEMS.length);
		setRarity(tokenID, chunkedCallResult[0], chunkedExtraCallResult[0], chunkedinventoryCallResult[0]);
	}

	/**************************************************************************
	**	Trigger a re-fetch of the rarities from an in-app update
	**************************************************************************/
	async function	fetchRarity() {
		const {result} = await fetcher(`${process.env.NETWORK_API_URL}
			?module=account
			&action=tokennfttx
			&contractaddress=${process.env.RARITY_ADDR}
			&address=${address}
			&apikey=${process.env.NETWORK_KEY}`);
		await updateRarities(result);
	}

	/**************************************************************************
	**	Once we got data from FTMScan, try to build the rarities
	**************************************************************************/
	useEffect(() => {
		if (data?.result && provider) {
			if (data?.status === 0) {
				return setTimeout(() => fetchRarity(), 100);
			}
			updateRarities(data?.result);
		}
	}, [data, provider]);

	useEffect(() => {
		if (loaded === false)
			setTimeout(() => !active ? set_loaded(true) : null, 10000); //10s before unlock
	}, [loaded]);

	return (
		<RarityContext.Provider
			value={{
				isLoaded: loaded,
				rarities,
				inventory,
				currentAdventurer,
				set_currentAdventurer,
				updateRarity,
				fetchRarity,
				rNonce,
				openCurrentAventurerModal: () => set_isModalOpen(true)
			}}>
			{children}
			<ModalCurrentAdventurer isOpen={isModalOpen} closeModal={() => set_isModalOpen(false)} />
		</RarityContext.Provider>
	);
};

export const useRarity = () => useContext(RarityContext);
export default useRarity;
