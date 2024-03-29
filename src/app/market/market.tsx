"use client"
import { COIN_COLOR, STARTING_USDC_BALANCE, USDC_COLOR } from "@/constants"
import { Coin, Coinsplit, USDCSplit, USDCoin } from "../coinsplit/coinsplit"

import { useSpring, animated } from "@react-spring/web"
import React, {
  MutableRefObject,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react"
import { DemoZone } from "../track/intro/DemoZone"
import { FillableBag } from "../bag/bag"
import { USDCBag } from "../bag/usdcbag/usdcbag"
import clsx from "clsx"
import { sleep } from "./sleep"
import { Transition } from "@headlessui/react"

function useSpringEnter(from?: "above" | "below") {
  const [spring, api] = useSpring(
    () => ({ from: { opacity: 0, y: from === "below" ? 500 : -500 } }),
    [from]
  )
  useEffect(() => {
    api.start({ to: { opacity: 1, y: 0 } })
  }, [api])
  return spring
}

export function AnimatedEnter({
  children,
  from,
}: {
  children: React.ReactNode
  from?: "above" | "below"
}) {
  const spring = useSpringEnter(from)
  return <animated.div style={spring}>{children}</animated.div>
}

export function MisterMarket({
  condition,
  price,
  targetPosition,
}: {
  condition?: "pass" | "fail"
  price?: ReactNode
  targetPosition: [x: string, y: string]
}) {
  const spring = useSpringEnter()
  const sprong = useSpring({ top: targetPosition[1], left: targetPosition[0] })
  return (
    <animated.div style={spring}>
      <animated.div
        className={clsx(
          "rounded-xl flex flex-col justify-center items-center font-mono text-center",
          "bg-zinc-700 rounded-xl",
          condition === undefined
            ? "border-zinc-300 text-white"
            : condition === "pass"
            ? "border-lime-100 text-lime-100"
            : "border-red-100 text-red-100"
        )}
        style={{
          ...sprong,
          position: "absolute",
          transform: "translate(-50%, -50%)",
          border: "4px dashed",
          width: "250px",
          height: "250px",
        }}
      >
        <div className="text-5xl mb-3">
          {condition === undefined ? (
            "the"
          ) : condition === "pass" ? (
            <span className="text-lime-500">PASS</span>
          ) : (
            <span className="text-red-500">FAIL</span>
          )}{" "}
          market
        </div>
        <div>
          1{" "}
          <span
            style={{ color: condition === undefined ? COIN_COLOR : undefined }}
          >
            {
              {
                none: "",
                fail: <span className="text-red-500">f</span>,
                pass: <span className="text-lime-500">p</span>,
              }[condition ?? "none"]
            }
            META
          </span>{" "}
          :: {price ?? "49,000"}{" "}
          <span
            style={{ color: condition === undefined ? USDC_COLOR : undefined }}
          >
            {
              {
                none: "",
                fail: <span className="text-red-500">f</span>,
                pass: <span className="text-lime-500">p</span>,
              }[condition ?? "none"]
            }
            USDC
          </span>
        </div>
      </animated.div>
    </animated.div>
  )
}

const useStupidSprings = (
  balance: number, // this is a lie. its actually like 4 minus this number
  hideLPMeta: boolean
) => {
  const idiotBalance = 4 - balance
  const left1 = useSpring({
    left: idiotBalance > 0 ? "50%" : "0%",
    opacity: hideLPMeta && idiotBalance > 0 ? 0 : 1,
    top: idiotBalance > 0 ? "0%" : "100%",
  })
  const left2 = useSpring({
    opacity: hideLPMeta && idiotBalance > 1 ? 0 : 1,

    left: idiotBalance > 1 ? "50%" : idiotBalance > 0 ? "0%" : "3%",
    top: idiotBalance > 1 ? "0%" : idiotBalance > 0 ? "100%" : "103%",
  })
  const left3 = useSpring({
    opacity: hideLPMeta && idiotBalance > 2 ? 0 : 1,

    left:
      idiotBalance > 2
        ? "50%"
        : idiotBalance > 1
        ? "0%"
        : idiotBalance > 0
        ? "3%"
        : "6%",
    top:
      idiotBalance > 2
        ? "0%"
        : idiotBalance > 1
        ? "100%"
        : idiotBalance > 0
        ? "103%"
        : "106%",
  })
  const left4 = useSpring({
    opacity: hideLPMeta && idiotBalance > 3 ? 0 : 1,
    left:
      idiotBalance > 3
        ? "50%"
        : idiotBalance > 2
        ? "0%"
        : idiotBalance > 1
        ? "3%"
        : idiotBalance > 0
        ? "6%"
        : "9%",
    top:
      idiotBalance > 3
        ? "0%"
        : idiotBalance > 2
        ? "100%"
        : idiotBalance > 1
        ? "103%"
        : idiotBalance > 0
        ? "106%"
        : "109%",
  })
  return [left1, left2, left3, left4]
}

export function MarketBase({
  left,
  right,
  buyLeft,
  sellLeft,
  leftBalance, // this is a lie. its actually like 4 minus this number
  bagPosition,
  targetPosition,
  rightCoin,
  hideLPMeta,
}: {
  left: React.ReactNode
  right: React.ReactNode
  buyLeft: MutableRefObject<null | (() => void)>
  sellLeft: MutableRefObject<null | (() => void)>
  leftBalance: number
  bagPosition: [x: string, y: string]
  targetPosition: [x: string, y: string]
  rightCoin: React.ReactNode
  hideLPMeta?: boolean // this should really be instant but isnt
}) {
  const [left1, left2, left3, left4] = useStupidSprings(
    leftBalance,
    hideLPMeta ?? false
  )

  return (
    <>
      <div className="mix-blend-lighten">
        {[
          left4,
          left3,
          //left2,
          //left1
        ].map((spring, index) => (
          <animated.div
            /** LEFT side */
            key={index}
            className={clsx(
              "absolute translate-x-[-50%] translate-y-[-50%]"
              //hideLPMeta && leftBalance - 1 < index && "hidden"
            )}
            style={spring}
            //onClick={() => setBalance((prev) => prev + 1)}
          >
            {left}
          </animated.div>
        ))}
      </div>
      <div>
        <FillableBag
          emitRef={buyLeft}
          emitRefSell={sellLeft}
          bagPosition={bagPosition}
          targetPosition={targetPosition}
          bag={right}
          thingy={rightCoin}
        />
      </div>
    </>
  )
}

const LEFT_BALANCE_EACH_STEP = {
  0: 4,
  1: 4,
}

const ANIMATION_DURATION = 1500
export function Market({
  bagPosition,
  marketPosition,
  amountRight,
  amountLeft,
  showMarket,
  showCoins,
  showLeftCoins,
  condition,
  rightLabel,
  price,
  hideLPMeta,
}: {
  bagPosition: [x: string, y: string]
  marketPosition: [x: string, y: string]
  amountRight: number
  amountLeft: number
  showMarket: boolean
  showCoins: boolean
  showLeftCoins: boolean
  condition?: "pass" | "fail"
  rightLabel?: string
  price?: ReactNode
  hideLPMeta?: boolean
}) {
  const buyLeft = useRef<null | (() => void)>(null)
  const sellLeft = useRef<null | (() => void)>(null)

  const prevAmountRight = useRef(amountRight)
  const prevAmountLeft = useRef(amountLeft)

  const [awaitedLeftAmount, setAwaitedLeftBalance] = useState(amountLeft)
  const [awaitedRightAmount, setAwaitedRightBalance] = useState(amountRight)

  useEffect(() => {
    const diffRight = amountRight - prevAmountRight.current
    const coinsBought = Math.floor(Math.abs(diffRight / 49000))
    const actionCount = coinsBought * 15
    const actionType = diffRight < 0 ? "buyLeft" : "sellLeft"

    const coinsBought2 = amountLeft - prevAmountLeft.current

    const buyStuff = async () => {
      if (actionType === "buyLeft") {
        setAwaitedRightBalance(amountRight)
        for (let i = 0; i < actionCount; i++) {
          buyLeft.current?.()
          await sleep(ANIMATION_DURATION / actionCount)
        }
      }

      for (let a = 0; a < Math.abs(coinsBought2); a++) {
        await sleep(200)
        setAwaitedLeftBalance(
          (prev) => prev + coinsBought2 / Math.abs(coinsBought2)
        )
        await sleep(200)
      }

      if (actionType === "sellLeft") {
        setAwaitedRightBalance(amountRight)
        for (let b = 0; b < actionCount; b++) {
          await sleep(ANIMATION_DURATION / actionCount)
          sellLeft.current?.()
        }
      }

      setAwaitedLeftBalance(amountLeft) // just to avoid race conditions.
    }
    buyStuff()
    prevAmountRight.current = amountRight
    prevAmountLeft.current = amountLeft
  }, [amountLeft, amountRight])

  return (
    <>
      {
        <MarketBase
          bagPosition={bagPosition}
          targetPosition={marketPosition}
          leftBalance={awaitedLeftAmount}
          buyLeft={buyLeft}
          sellLeft={sellLeft}
          hideLPMeta={hideLPMeta}
          left={
            <Transition
              show={showLeftCoins && showCoins}
              enter="transition-opacity duration-150"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              {condition === undefined ? (
                <Coinsplit />
              ) : (
                <Coin condition={condition} />
              )}
            </Transition>
          }
          right={
            <Transition
              show={showCoins}
              enter="transition-opacity duration-150"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <USDCBag
                amount={awaitedRightAmount}
                condition={condition}
                label={rightLabel}
              />
            </Transition>
          }
          rightCoin={
            <div className="scale-[0.5]">
              {condition === undefined ? (
                <USDCSplit />
              ) : (
                <USDCoin condition={condition} />
              )}
            </div>
          }
        />
      }
      {showMarket && (
        <MisterMarket
          targetPosition={marketPosition}
          condition={condition}
          price={price}
        />
      )}
    </>
  )
}

export default function Home() {
  const [amountRight, setAmountRight] = useState(STARTING_USDC_BALANCE)
  const [amountLeft, setAmountLeft] = useState(0)

  const buy = () => {
    setAmountRight((prev) => prev - 49000)
    setAmountLeft((prev) => prev + 1)
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center p-24"
      onClick={buy}
    >
      <DemoZone>
        <Market
          showCoins
          showMarket
          marketPosition={["50%", "0%"]}
          bagPosition={["100%", "100%"]}
          amountLeft={amountLeft}
          amountRight={amountRight}
          showLeftCoins
        />
      </DemoZone>
    </main>
  )
}
