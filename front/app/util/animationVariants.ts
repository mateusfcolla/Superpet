import { motion, Variants } from "framer-motion";

export const pop: Variants = {
    offscreen: {
      opacity: 0,
    },
    onscreen: {
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.2,
        duration: 0.8
      }
    }
  }

export const popFromLeft: Variants = {
    offscreen: {
      x: -400,
      opacity: 0,
    },
    onscreen: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.2,
        duration: 0.8
      }
    }
  }

export const popFromRight: Variants = {
offscreen: {
    x: 400,
    opacity: 0,
},
onscreen: {
    x: 0,
    opacity: 1,
    transition: {
    type: "spring",
    bounce: 0.2,
    duration: 0.8
    }
}
}

export const popFromTop: Variants = {
offscreen: {
    y: -400,
    opacity: 0,
},
onscreen: {
    y: 0,
    opacity: 1,
    transition: {
    type: "spring",
    bounce: 0.2,
    duration: 0.8
    }
}
}

export const popFromBottom: Variants = {
offscreen: {
    y: 400,
    opacity: 0,
},
onscreen: {
    y: 0,
    opacity: 1,
    transition: {
    type: "spring",
    bounce: 0.2,
    duration: 0.8
    }
}
}