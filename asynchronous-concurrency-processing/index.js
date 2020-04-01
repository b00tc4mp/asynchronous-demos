function randomInteger(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)

    return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomWait(fromMillis, toMillis) {
    const millis = randomInteger(fromMillis, toMillis)

    return new Promise(resolve => setTimeout(() => resolve(millis), millis))
}

const wait = () => randomWait(1, 1500)

async function process(id, subject) {
    console.log(`ACTION load "${subject}" (branch ${id}, took ${await wait()}ms)`)

    console.log(`ACTION process other related things to "${subject}" (branch ${id}, took ${await wait()}ms)`)

    console.log(`ACTION save that "${subject}" (branch ${id}, took ${await wait()}ms)`)
}

// PROBLEM "parallel" execution does not mean each asynchronous process runs its internal promises in series in one shot
// set 0/1 to disable/enable this demo
0 && (async () => await Promise.all([process(0, 'game'), process(1, 'game')]))()

// SOLUTION semaphore processes so that 

const semaphores = {}

class Semaphore {
    light = 'green'

    setGreen() { this.light = 'green' }

    isGreen() { return this.light === 'green' }

    setRed() { this.light = 'red' }

    isRed() { return this.light === 'red' }
}

function semaphore(id, handle) {
    const semaphore = semaphores[id] || (semaphores[id] = new Semaphore())

        ; (function check() {
            if (semaphore.isGreen()) return handle(semaphore)

            setTimeout(check, 0)
        })()
}

// set 0/1 to disable/enable this demo
0 && (async () => await Promise.all([
    new Promise(resolve => {
        semaphore('game', semaphore => {
            semaphore.setRed()

            process(0, 'game')
                .then(() => {
                    semaphore.setGreen()

                    resolve()
                })
        })
    }),
    new Promise(resolve => {
        semaphore('game', semaphore => {
            semaphore.setRed()

            process(1, 'game')
                .then(() => {
                    semaphore.setGreen()

                    resolve()
                })
        })
    })
]))()