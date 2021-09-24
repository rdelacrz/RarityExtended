/******************************************************************************
**	@Author:				Rarity Extended
**	@Twitter:				@RXtended
**	@Date:					Tuesday September 7th 2021
**	@Filename:				tavern.js
******************************************************************************/

import	React, {useState}					from	'react';
import	Image								from	'next/image';
import	useDungeon, {DungeonContextApp}		from	'contexts/useDungeonsTheCellar';
import	useWeb3								from	'contexts/useWeb3';
import	useRarity							from	'contexts/useRarity';
import	DialogBox							from	'components/DialogBox';
import	Typer								from	'components/Typer';
import	{exploreTheForest}					from	'utils/actions';

const	classMappingImg = [
	'',
	'/front/barbarian.svg',
	'/front/bard.svg',
	'/front/cleric.svg',
	'/front/druid.svg',
	'/front/fighter.svg',
	'/front/monk.svg',
	'/front/paladin.svg',
	'/front/ranger.svg',
	'/front/rogue.svg',
	'/front/sorcerer.svg',
	'/front/wizard.svg',
];

function	FacuHeadline() {
	const	[facuTextIndex, set_facuTextIndex] = useState(0);
	
	const	renderFacuText = () => {
		return (
			<>
				<Typer onDone={() => set_facuTextIndex(i => i + 1)} shouldStart={facuTextIndex === 0}>
					{'YOU ARE ABOUT TO LEAVE THE TOWN TO EXPLORE '}
				</Typer>
				<span className={'text-tag-info'}><Typer onDone={() => set_facuTextIndex(i => i + 1)} shouldStart={facuTextIndex === 1}>
					{'THE FOREST'}
				</Typer></span>
				<Typer onDone={() => set_facuTextIndex(i => i + 1)} shouldStart={facuTextIndex === 2}>
					{'. FOR HOW LONG DO YOU WANT TO TAKE PROVISIONS FOR ?'}
				</Typer>
			</>
		);
	};
	return (
		<h1 className={'text-sm md:text-lg leading-normal md:leading-10'}>
			{renderFacuText()}
		</h1>
	);
}

function	Index({dungeon, adventurer, router}) {
	const	{provider} = useWeb3();
	const	{updateRarity} = useRarity();

	return (
		<section className={'mt-12 max-w-full'}>
			<div className={'max-w-screen-lg w-full mx-auto'}>
				<div className={'flex flex-col md:flex-row items-center md:items-center mb-8 md:mb-8'}>
					<div className={'w-auto md:w-64 mr-0 md:mr-16'} style={{minWidth: 256}}>
						<Image
							src={classMappingImg[adventurer.class]}
							loading={'eager'}
							quality={100}
							width={256}
							height={256} />
					</div>
					<FacuHeadline />
				</div>
				<DialogBox
					options={[
						{label: 'Go for 4 days', onClick: () => {
							exploreTheForest({provider, contractAddress: process.env.DUNGEON_THE_FOREST_ADDR, tokenID: adventurer.tokenID, timeInDays: 4},
								({error}) => {
									if (error) {
										return console.error(error);
									}
									updateRarity(dungeon.tokenID);
									router.push('/town/quest?tab=the-forest');
								});
						}},
						{label: 'Go for 5 days', onClick: () => {
							exploreTheForest({provider, contractAddress: process.env.DUNGEON_THE_FOREST_ADDR, tokenID: adventurer.tokenID, timeInDays: 5},
								({error}) => {
									if (error) {
										return console.error(error);
									}
									updateRarity(dungeon.tokenID);
									router.push('/town/quest?tab=the-forest');
								});
						}},
						{label: 'Go for 6 days', onClick: () => {
							exploreTheForest({provider, contractAddress: process.env.DUNGEON_THE_FOREST_ADDR, tokenID: adventurer.tokenID, timeInDays: 6},
								({error}) => {
									if (error) {
										return console.error(error);
									}
									updateRarity(dungeon.tokenID);
									router.push('/town/quest?tab=the-forest');
								});
						}},
						{label: 'Go for 7 days', onClick: () => {
							exploreTheForest({provider, contractAddress: process.env.DUNGEON_THE_FOREST_ADDR, tokenID: adventurer.tokenID, timeInDays: 7},
								({error}) => {
									if (error) {
										return console.error(error);
									}
									updateRarity(dungeon.tokenID);
									router.push('/town/quest?tab=the-forest');
								});
						}},
					]} />
			</div>
		</section>
	);		
}

function	Wrapper({router, adventurer}) {
	const	{dungeon} = useDungeon();

	return (
		<Index router={router} dungeon={dungeon} adventurer={adventurer} />
	);
}

function	WithContext({rarities, router}) {
	if (!rarities || rarities === {}) {
		return null;
	}
	if (!rarities[router?.query?.adventurer]) {
		if (typeof(window) !== 'undefined')
			router.push('/town/quest?tab=the-forest');
		return null;
	}
	return (
		<DungeonContextApp adventurer={rarities[router?.query?.adventurer]}>
			<Wrapper router={router} adventurer={rarities[router?.query?.adventurer]} />
		</DungeonContextApp>
	);
}

export default WithContext;
