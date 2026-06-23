"use client"
import { useEffect, useState } from "react"
import { Block } from "./track/intro/Block"
import { BetterTypeAnimation } from "./track/intro/BetterTypeAnimation"
import { Splitter, USDCoin } from "@/app/coinsplit/coinsplit"
import { AnimatedEnter, Market } from "@/app/market/market"
import { PMETA_PRICE, STARTING_USDC_BALANCE } from "@/constants"
import clsx from "clsx"
import { animated, useSpring } from "@react-spring/web"
import { Redeem2 } from "@/app/redeem/redeem"
import { Transition } from "@headlessui/react"
import { sendGAEvent } from "@next/third-parties/google"

const usePriceAnimation = (go: boolean) => {
  const spring = useSpring({
    passPrice: !go ? PMETA_PRICE : 49800,
  })
}

/** input: number of minutes
 * output: formatted string in form of: 00d 00h 00m
 */
const formatCountdown = (minutes: number) => {
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const remainingMinutes = Math.floor(minutes % 60)

  const formattedDays = days.toString().padStart(2, "0")
  const formattedHours = hours.toString().padStart(2, "0")
  const formattedMinutes = remainingMinutes.toString().padStart(2, "0")

  return `${formattedDays}d ${formattedHours}h ${formattedMinutes}m`
}

//
const TIME_LEFT = 1440 * 4 - 870

// --- Analytics: explainer funnel -------------------------------------------
// The whole guide is driven by a single `read` counter that starts at -9 and
// ends when the EndCard shows (read > 34). We normalise to a 1-based step
// (read + 9) so the first interaction is step 1 and the EndCard is step 44,
// and tag each step with its narrative chapter so GA4 can show chapter-level
// dropoff as well as step-level. Production-only, matching <GoogleAnalytics>.
const TOTAL_EXPLAINER_STEPS = 44 // read 35 (EndCard) => step 44

const explainerChapter = (read: number) => {
  if (read <= 0) return "1_intro" // 2064 setup + spot market
  if (read <= 16) return "2_conditional_tokens" // p/fUSDC, splitting
  if (read <= 26) return "3_conditional_markets" // how futarchy decides
  if (read <= 34) return "4_resolution" // proposal passes, redemption
  return "5_complete" // EndCard
}

const trackExplainerStep = (read: number) => {
  if (process.env.NODE_ENV !== "production") return
  const step = read + 9 // first click -> step 1
  if (step < 1 || step > TOTAL_EXPLAINER_STEPS) return
  sendGAEvent("event", "explainer_step", {
    step,
    chapter: explainerChapter(read),
    completed: step === TOTAL_EXPLAINER_STEPS,
  })
}

const Block1 = ({
  read,
  doneWaiting,
  fade,
}: {
  read: number
  doneWaiting: () => void
  fade: boolean
}) => {
  const spring = useSpring({
    from: { opacity: 1 },
    to: {
      opacity: fade ? 0.5 : 1,
      y: fade ? -48 : 0,
    },
  })

  return (
    <animated.div className="flex flex-col" style={spring}>
      {read > -1 && (
        <BetterTypeAnimation
          doneWaiting={doneWaiting}
          fastForward={read > 0}
          sequence={[
            "The year is 2064.",
            500,
            "The year is 2064. \n You just got word on the byte nexus that the MetaDAO might be the first corp to fit asteroid miners with hypertronic tractor beams.",
          ]}
        />
      )}
      {read > 0 && (
        <BetterTypeAnimation
          doneWaiting={doneWaiting}
          fastForward={read > 1}
          sequence={[
            "You know tractor beams like the back of your hand.",
            500,
            "You know tractor beams like the back of your hand. The biggest beam corps from Earth say hypertronic isn’t worth the plutonium, they say it barely moves the needle.",
          ]}
        />
      )}
      {read > 1 && (
        <BetterTypeAnimation
          doneWaiting={doneWaiting}
          fastForward={read > 2}
          sequence={[
            "Yeah right.",
            500,
            "Yeah right. Hypertronic changes everything.",
          ]}
        />
      )}
      {read > 2 && (
        <BetterTypeAnimation
          fastForward={read > 3}
          doneWaiting={doneWaiting}
          sequence={["You want in."]}
        />
      )}
    </animated.div>
  )
}

const EndCard = () => (
  <main className="endcard flex min-h-screen flex-col items-center justify-start p-24 absolute top-0 left-0 right-0 bottom-0">
    <div className="mb-20 h-[30vh] w-full flex flex-col justify-end max-w-3xl">
      <Block
        neverFade
        read={1}
        doneWaiting={() => {}}
        sequences={[
          [
            "Thank you for letting me be your futarchy guide.",
            500,
            "Thank you for letting me be your futarchy guide. Welcome to the MetaDAO, cyberanon. ",
          ],
        ]}
      />
    </div>
  </main>
)

export default function Chapter2() {
  const [read, setRead] = useState(-9)

  const chapterOneRead = read + 9
  const chapterOneEnded = read > 0
  const [marketStep, setMarketStep] = useState(0)

  const [waiting, setWaiting] = useState(true)

  const nextChat = () => {
    setWaiting(true)
    // if (!waiting) {
    setRead((prev) => {
      const next = prev + 1
      trackExplainerStep(next)
      return next
    })
    //}
  }

  const showPassCoinAfter = 4
  const showFailCoinAfter = 6
  const demonstrateMergeAfter = 8
  const endCoinDemoAfter = 9

  const beginTradingDemoAfter = 10
  const splitBagAFter = 11
  const showMarketsAfter = 12
  const buypMetaAfter = 13
  const discussFutarchyAfter = 17

  const startedWatchingMarket = read > 26
  const finishedWatchingMarket = read > 27

  const itsTimeToBeginRedemption = read > 29
  const discardFail = read > 32
  const discardFail2 = discardFail
  const REDEEEM = read > 33
  //const hideMarketsFinal

  const combineCoins = read > demonstrateMergeAfter && read <= splitBagAFter //&& read <= recombineCoinsAfter

  const passPrice =
    read <= buypMetaAfter
      ? PMETA_PRICE
      : !startedWatchingMarket
      ? PMETA_PRICE + 2
      : 51200
  const failPrice = !startedWatchingMarket ? 49003 : 48300
  const [priceSpring, priceApi] = useSpring(
    () => ({
      from: { passPrice: PMETA_PRICE, failPrice: 49003 },
    }),
    []
  )

  useEffect(() => {
    if (!startedWatchingMarket) {
      priceApi.start({
        to: { passPrice, failPrice },
        config: { duration: 1500 },
      })
    } else {
      const totalDuration = 10000

      priceApi.start({
        to: async (next) => {
          await next({
            passPrice: PMETA_PRICE + 400,
            failPrice: 49003 - 500,
            config: { duration: 2000 },
          })
          await next({
            passPrice: PMETA_PRICE + 1000,
            failPrice: 49003 - 300,
            config: { duration: 2000 },
          })
          await next({
            passPrice: PMETA_PRICE + 2000,
            failPrice: 49003 - 800,
            config: { duration: 2000 },
          })
          await next({
            passPrice: PMETA_PRICE + 2100,
            failPrice: 49003 - 500,
            config: { duration: 2000 },
          })
          await next({
            passPrice: passPrice,
            failPrice: failPrice,
            config: { duration: 2000 },
          })
        },
      })
    }
  }, [failPrice, passPrice, priceApi, startedWatchingMarket])

  const clockSpring = useSpring({
    clock: startedWatchingMarket ? 0 : TIME_LEFT,
    config: { duration: 10000 },
  })
  const clockOpacity = useSpring({
    opacity: !startedWatchingMarket || finishedWatchingMarket ? 0 : 1,
  })

  // const asr = useSpringRef()
  const areaSizeSpring = useSpring({
    //ref: asr,
    maxWidth:
      (read < beginTradingDemoAfter || read > discussFutarchyAfter) &&
      !itsTimeToBeginRedemption
        ? "606px"
        : "606px",
  })

  //const fudr = useSpringRef()
  const fusdcLeaveSpring = useSpring({
    //ref: fudr,
    opacity: discardFail ? 0 : 1,
    //maxWidth: discardFail ? "0%" : "100%",
  })
  //useChain([fudr, asr])

  const itsOver = read > 34

  return (
    <>
      {itsOver && <EndCard />}
      <Transition
        show={!itsOver}
        leave="transition-opacity duration-[5000ms]"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <main
          className="flex min-h-screen flex-col items-center justify-start p-24"
          onClick={nextChat}
        >
          <div className="mb-20 h-[30vh] w-full flex flex-col justify-end max-w-3xl">
            <Block1
              read={chapterOneRead}
              doneWaiting={() => setWaiting(false)}
              fade={chapterOneRead > 3}
            />
            <Block
              read={chapterOneRead - 3}
              doneWaiting={() => setWaiting(false)}
              //fade={step === "2"}
              sequences={[
                [
                  500,
                  "You’ve traded DAO shares before. It’s not all that different from how your mom traded stocks on the oldnet in 2020. You can get all the META you want, as long as you have the cash. ",
                ],
                [
                  "That's where the market comes in.",
                  250,
                  "That's where the market comes in..",
                  250,
                  "That's where the market comes in...",
                  500,
                  () => setMarketStep(Math.max(marketStep, 1)),
                  "That's where the market comes in.",
                ],
                [
                  "You check out prices.",
                  500,
                  "You check out prices. 1 META = 49,000 USDC.", // TODO animate this
                ],
                [
                  "It’s low. ",
                  250,
                  "It’s low. MetaDAO announced exploratory investment in hypertronics a month ago and the price has barely moved an inch.",
                  250,
                  "It’s low. MetaDAO announced exploratory investment in hypertronics a month ago and the price has barely moved an inch. You’re still early.",
                ],
                [
                  "You portion out your budget",
                  500,
                  () => setMarketStep(Math.max(marketStep, 2)),
                  1000,

                  "You portion out your budget and buy a few META. ",
                  500,
                  () => setMarketStep(Math.max(marketStep, 3)),
                  1500,
                ],
                [
                  "Woah woah, slow down. MetaDAO is a *futarchy*. Sure, you can trade this news on the spot market, but there’s a *much better* way. Go ahead and undo that purchase. You’ll thank me later.",
                  () => setMarketStep(Math.max(marketStep, 4)),
                  1500,
                ],
                /*<BetterTypeAnimation
              key="wumbo1"
              doneWaiting={() => setWaiting(false)}
              sequence={["a"]}
              fastForward={read - 3 > 8}
            />,*/
              ]}
            />
            <Block
              read={read}
              doneWaiting={() => setWaiting(false)}
              //fade={false}
              sequences={[
                [
                  "You see, rolling out hypertronic tractor beams is still a *proposal*. You only want to buy META in the event that that proposal passes, right? If the proposal fails, your investment thesis -- and the MetaDAO's efforts to grow mining revenue -- will fail right along with it.",
                ], // 1
                [
                  "What you want is for your investment to be *conditional* on the proposal passing. That way, if the proposal fails, you'll have kept your money.",
                ], // 2
                [
                  "You need a way to be holding META in the case where the proposal passes, while at the same time holding USDC in the case where the proposal fails.",
                ], // 3
                [
                  "How? Let's take a step back. It's time to learn about conditional tokens. For every active proposal, the MetaDAO lets you create conditional tokens.",
                ], // 4
                [
                  500,
                  "What you're looking at now is 1 USDC, *conditional* upon passing the hypertronics proposal.", // todo insert gag about renaming the token.
                  500,
                  "What you're looking at now is 1 USDC, *conditional* upon passing the hypertronics proposal. If the proposal passes, it will turn into 1 USDC.", //insert gag about renaming the token.
                ], // 5
                ['For short, we\'ll call it "pass USDC", or pUSDC.'], // 6
                ["Likewise, it has a sister token: fUSDC."], //7
                [
                  "If the proposal passes, the pUSDC will become USDC. If the proposal fails, the fUSDC will become USDC.",
                ], //8
                ["Thus, having one of each is the same as just having 1 USDC."], //9
                [
                  "That's not the interesting part. The interesting part is that you can *trade* each of them separately, for conditional META.",
                ], //10  // todo timing
                ["Get out your USDC again, let's split it."], // 11 //todo timing
                [
                  "As I mentioned, you can trade your pUSDC and fUSDC separately. There's a market for each.",
                ], //12 //todo timing
                [
                  "What you want is to have META in the event that the proposal passes, but keep your USDC in the event that the proposal fails.",
                  500,
                  "What you want is to have META in the event that the proposal passes, but keep your USDC in the event that the proposal fails. That means you want to trade your pUSDC for pMETA, but keep your fUSDC.",
                ], //13
                [
                  "Perfect.",
                  500,
                  "Perfect. Now you've invested like a proper futarchic cyberdenizen.",
                  500,
                  `Perfect. Now you've invested like a proper futarchic cyberdenizen. If the proposal passes, you'll have 2 META and $${
                    STARTING_USDC_BALANCE - PMETA_PRICE * 2
                  } USDC. If the proposal fails, you'll have $${STARTING_USDC_BALANCE} USDC, just as you started.`,
                ], //14
                <span key="great" className="text-yellow-400 ml-8 -mr-8">
                  <BetterTypeAnimation
                    doneWaiting={() => setWaiting(false)}
                    sequence={[
                      "Great. When will the DAO vote on the proposal?",
                    ]}
                    fastForward={read > 15}
                  />
                </span>, //15
                ["Right. I forgot. You're clueless."], //16
              ]}
            />
            <Block
              read={read - 16}
              doneWaiting={() => setWaiting(false)}
              //fade={false}
              sequences={[
                [
                  "You didn't realize it yet, but this *is* the vote, and you just voted.",
                ], //17
                [
                  "You're done investing, so let's forget about your tokens for a moment and just focus on the markets.",
                ], //18
                /*  [
              "To be clear-- your investment doesn't actually require you to understand how the MetaDAO is governed. If the proposal passes, you invest, and if it doesn't, you don't; you don't need to predict whether the proposal passes, because in either case, you've already allocated your funds the way you wanted.",
            ], */
                [
                  "Because the markets are separate, their prices will diverge; traders come to a consensus on the price of META in the world where the proposal passes, and a separate consensus on the price of META if the proposal fails.",
                ], //19
                [
                  "A futarchic DAO is market-driven; for every proposal made, a pair of conditional markets like these is created. If the pass market prices META at a higher price than the fail market, the proposal passes. Otherwise, it fails.",
                ], //20
                <span key="thatsit" className="text-yellow-400 ml-8 -mr-8">
                  <BetterTypeAnimation
                    doneWaiting={() => setWaiting(false)}
                    sequence={[
                      "That's it? The DAO is just governed by conditional markets? So I've influenced the DAO to pass this proposal, because I pushed the price of pMETA upwards in the pass market?",
                    ]}
                    fastForward={read > 21}
                  />
                </span>, //21
                ["Yes. Welcome to Futarchy, cyberanon."], //22
                [
                  `The market price for META in the world where this proposal passes is $${(
                    PMETA_PRICE + 2
                  ).toLocaleString()}, and $49,003 in the world where the proposal fails.`,
                ], //23
                <span key="what" className="ml-8 -mr-8 text-yellow-400">
                  <BetterTypeAnimation
                    doneWaiting={() => setWaiting(false)}
                    sequence={["Wait, that's crazy. "]}
                    fastForward={read > 24} // todo
                  />
                </span>, //24
                <span key="huh" className="ml-8 -mr-8 text-yellow-400">
                  <BetterTypeAnimation
                    doneWaiting={() => setWaiting(false)}
                    sequence={[
                      "Shouldn't the price in the pass market be higher?",
                      500,

                      "Shouldn't the price in the pass market be higher? There is no way the MetaDAO is worth more without using hypertronics. The crystallic yields are over 500% greater than conventional tractor beams!",
                    ]}
                    fastForward={read > 25} //todo
                  />
                </span>, //25
                [
                  "Indeed. Not every market participant is a beamjunkie like yourself, and the big players in conventional beamtech have say-for-pay goons all over socialnet FUDing hypertronic.",
                  500,
                  "Indeed. Not every market participant is a beamjunkie like yourself, and the big players in conventional beamtech have say-for-pay goons all over socialnet FUDing hypertronic. Give it time, you might be glued to the nexus feed, but other tractor beam experts will take time to filter in.",
                ], // 26
              ]}
            />
            <Block
              read={read - 27}
              doneWaiting={() => setWaiting(false)}
              sequences={[
                [
                  "Nice.",
                  500,
                  "Nice. Once word spread on minetech postfeeds, every beamjunkie wanted a chance to ride the hypertronics wave.",
                ], //28
                [
                  "Once that happened, META started trading higher on the pass market than in the fail market. Therefore, the proposal passes.",
                ], //29
                <span key="huh" className="ml-8 -mr-8 text-yellow-400">
                  <BetterTypeAnimation
                    doneWaiting={() => setWaiting(false)}
                    sequence={["That is most rational."]}
                    /* speed={7}
                sequence={[
                  "Lets freaking go.",
                  250,
                  "Lets freaking go!",
                  250,
                  "Lets freaking go!!!",
                ]} */
                    fastForward={read > 30} //todo
                  />
                </span>, //30
                ["Here are your tokens again."], // 31
                [
                  "Since the proposal did not fail, the fail market is cancelled... ",
                ], //32,
                ["...and the pass market's tokens become regular tokens."], //33
                [
                  "The MetaDAO was able to capture and incorporate your knowledge because you were willing to put your money where your mouth is. The asteroid mining industry is drenched in lies and DAO manipulation, but any effort to drive the pass market down just presents opportunity to beamtech experts like yourself.",
                ], // 33
              ]}
            />
            <Block
              neverFade
              read={itsOver ? 1 : 0}
              doneWaiting={() => setWaiting(false)}
              sequences={[
                [
                  "Thank you for letting me be your futarchy guide.",
                  500,
                  "Thank you for letting me be your futarchy guide. Welcome to the MetaDAO, cyberanon. ",
                ],
              ]}
            />
          </div>
          <animated.div
            /** the countdown */ className={"text-2xl"}
            style={clockOpacity}
          >
            {clockSpring.clock.to((x) => formatCountdown(x))}
          </animated.div>
          <div className="w-full flex-1 flex flex-col py-12 justify-center items-center select-none mb-20">
            <animated.div
              className={"w-full h-full flex-1 max-h-[350px] relative scale-90"}
              style={areaSizeSpring}
            >
              <Transition
                show={!chapterOneEnded}
                leave="transition-opacity duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Market
                  showLeftCoins={marketStep > 2}
                  amountRight={
                    marketStep !== 3
                      ? STARTING_USDC_BALANCE
                      : STARTING_USDC_BALANCE - 49000 * 2
                  }
                  amountLeft={marketStep !== 3 ? 0 : 2}
                  marketPosition={["50%", "0%"]}
                  bagPosition={["100%", "100%"]}
                  showMarket={marketStep > 0}
                  showCoins={marketStep > 1}
                />
              </Transition>
              {
                <Splitter
                  split={
                    !combineCoins && read > showFailCoinAfter && !discardFail2
                  }
                  left={
                    <>
                      <Transition
                        appear
                        show={
                          read > showPassCoinAfter && read <= endCoinDemoAfter
                        }
                        enter="transition-opacity duration-150"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <USDCoin
                          condition="pass"
                          label={!combineCoins ? "1 pUSDC" : "1 USDC"}
                        />
                      </Transition>
                      {read <= beginTradingDemoAfter ? null : (
                        <AnimatedEnter key="trading" from="below">
                          <Redeem2
                            phase={REDEEEM}
                            left={
                              <div
                                className={clsx(
                                  "relative w-[404px] h-[300px] transition-transform ease-in-out duration-700",
                                  read > discussFutarchyAfter &&
                                    (!itsTimeToBeginRedemption || discardFail)
                                    ? "scale-100"
                                    : "scale-75"
                                )}
                              >
                                <Market
                                  showCoins={
                                    read <= discussFutarchyAfter ||
                                    itsTimeToBeginRedemption
                                  }
                                  showMarket={read > showMarketsAfter}
                                  hideLPMeta={startedWatchingMarket}
                                  showLeftCoins={
                                    read > buypMetaAfter ||
                                    itsTimeToBeginRedemption
                                  }
                                  bagPosition={
                                    read > showMarketsAfter
                                      ? ["100%", "100%"]
                                      : ["50%", "50%"]
                                  }
                                  marketPosition={
                                    read <= discussFutarchyAfter ||
                                    itsTimeToBeginRedemption
                                      ? ["50%", "0%"]
                                      : ["50%", "50%"]
                                  }
                                  amountLeft={read <= buypMetaAfter ? 0 : 2}
                                  amountRight={
                                    read <= buypMetaAfter
                                      ? STARTING_USDC_BALANCE
                                      : STARTING_USDC_BALANCE - PMETA_PRICE * 2
                                  }
                                  condition="pass"
                                  rightLabel={!combineCoins ? "pUSDC" : "USDC"}
                                  price={
                                    <animated.span>
                                      {priceSpring.passPrice.to((x) =>
                                        Math.floor(x).toLocaleString()
                                      )}
                                    </animated.span>
                                  }
                                />
                              </div>
                            }
                            right={
                              <div
                                className={clsx(
                                  "relative w-[404px] h-[300px] transition-transform ease-in-out duration-700", //I honestly dont even know why -75% is the (close enough to) right number here and im sorry
                                  read > discussFutarchyAfter &&
                                    (!itsTimeToBeginRedemption || discardFail)
                                    ? "scale-100"
                                    : "scale-75"
                                )}
                              >
                                <Market
                                  showCoins={
                                    read <= discussFutarchyAfter ||
                                    itsTimeToBeginRedemption
                                  }
                                  showMarket={read > showMarketsAfter}
                                  hideLPMeta={startedWatchingMarket}
                                  showLeftCoins={
                                    read > buypMetaAfter ||
                                    itsTimeToBeginRedemption
                                  }
                                  bagPosition={
                                    read > showMarketsAfter
                                      ? ["100%", "100%"]
                                      : ["50%", "50%"]
                                  }
                                  marketPosition={
                                    read <= discussFutarchyAfter ||
                                    itsTimeToBeginRedemption
                                      ? ["50%", "0%"]
                                      : ["50%", "50%"]
                                  }
                                  amountLeft={read <= buypMetaAfter ? 0 : 2}
                                  amountRight={
                                    read <= buypMetaAfter
                                      ? STARTING_USDC_BALANCE
                                      : STARTING_USDC_BALANCE - PMETA_PRICE * 2
                                  }
                                  rightLabel={!combineCoins ? "pUSDC" : "USDC"}
                                  price={
                                    <animated.span>
                                      {priceSpring.passPrice.to((x) =>
                                        Math.floor(x).toLocaleString()
                                      )}
                                    </animated.span>
                                  }
                                />
                              </div>
                            }
                          />
                        </AnimatedEnter>
                      )}
                    </>
                  }
                  right={
                    read > showFailCoinAfter ? (
                      read <= endCoinDemoAfter ? (
                        <Transition
                          appear
                          show={
                            read > showPassCoinAfter && read <= endCoinDemoAfter
                          }
                          enter="transition-opacity duration-150"
                          enterFrom="opacity-0"
                          enterTo="opacity-100"
                          leave="transition-opacity duration-150"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <USDCoin
                            condition="fail"
                            label={!combineCoins ? "1 fUSDC" : "1 USDC"}
                          />
                        </Transition>
                      ) : read <= beginTradingDemoAfter ? null : (
                        <AnimatedEnter from="below" key="trading">
                          <animated.div style={fusdcLeaveSpring}>
                            <div
                              className={clsx(
                                "relative w-[404px] h-[300px] transition-transform ease-in-out duration-700",
                                read > discussFutarchyAfter &&
                                  !itsTimeToBeginRedemption
                                  ? "scale-100"
                                  : "scale-75"
                              )}
                            >
                              <Market
                                showCoins={
                                  read <= discussFutarchyAfter ||
                                  itsTimeToBeginRedemption
                                }
                                showMarket={read > showMarketsAfter}
                                hideLPMeta={startedWatchingMarket}
                                showLeftCoins={false}
                                bagPosition={
                                  read > showMarketsAfter
                                    ? ["100%", "100%"]
                                    : ["50%", "50%"]
                                }
                                marketPosition={
                                  read <= discussFutarchyAfter ||
                                  itsTimeToBeginRedemption
                                    ? ["50%", "0%"]
                                    : ["50%", "50%"]
                                }
                                amountLeft={0}
                                amountRight={STARTING_USDC_BALANCE}
                                condition="fail"
                                rightLabel={!combineCoins ? "fUSDC" : "USDC"}
                                price={
                                  <animated.span>
                                    {priceSpring.failPrice.to((x) =>
                                      Math.floor(x).toLocaleString()
                                    )}
                                  </animated.span>
                                }
                              />
                            </div>
                          </animated.div>
                        </AnimatedEnter>
                      )
                    ) : null
                  }
                />
              }
            </animated.div>
          </div>
        </main>
      </Transition>
    </>
  )
}
