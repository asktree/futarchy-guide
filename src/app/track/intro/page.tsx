"use client"
import { useState, ReactNode } from "react"
import { animated, useSpring } from "@react-spring/web"
import { TypeAnimation } from "react-type-animation"
import { Market } from "@/app/market/market"
import { STARTING_USDC_BALANCE } from "@/constants"
import { BetterTypeAnimation } from "./BetterTypeAnimation"
import { useHash } from "./useHash"
import { Block } from "./Block"
import { DemoZone } from "./DemoZone"

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

export type BlockSequence = (
  | Parameters<typeof TypeAnimation>[0]["sequence"]
  | ReactNode
)[]

export default function Intro() {
  const [chapterOneRead, setRead] = useState(0)

  const [hash, pushStep] = useHash()
  const step = hash === "" ? "0" : hash

  const [waiting, setWaiting] = useState(true)

  const advance = () => {
    setWaiting(true)
    console.log("ss", step)
    pushStep((parseInt(step) + 1).toString())
  }

  const nextChat = () => {
    setWaiting(true)
    // if (!waiting) {
    setRead((prev) => prev + 1)
    //}
  }

  const [marketStep, setMarketStep] = useState(0)

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-start p-24"
      onClick={nextChat}
    >
      {/*      <Enter isVisible={step > 0}>
        <Coinsplit />
      </Enter> */}

      <div className="mb-4 h-[30vh] w-full flex flex-col gap-4 justify-end">
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
            ],
            [
              "Woah woah, slow down. MetaDAO is a *futarchy*. Sure, you can trade this news on the spot market, but there’s a *much better* way. Go ahead and undo that purchase. You’ll thank me later.",
              () => setMarketStep(Math.max(marketStep, 4)),
            ],
            /*<BetterTypeAnimation
              key="wumbo1"
              doneWaiting={() => setWaiting(false)}
              sequence={["a"]}
              fastForward={read - 3 > 8}
            />,*/
          ]}
        />
      </div>
      <DemoZone>
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
      </DemoZone>
      {/* <button
        className={`bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ${
          waiting ? "opacity-50" : ""
        }`}
        onClick={advance}
        disabled={waiting}
      >
        {waiting ? ". . ." : "gimme"}
      </button> */}
    </main>
  )
}
