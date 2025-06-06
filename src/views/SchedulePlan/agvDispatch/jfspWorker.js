// FJSP with AGV 算法实现（在 Worker 中运行）
class FJSPwithAGV {
  constructor(jobMachineTime, agvNumber, travelTimeForMachine) {
    this.jobMachineTime = jobMachineTime
    this.travelTime = travelTimeForMachine
    this.agvNumber = agvNumber
    this.jobNumber = jobMachineTime.length
    this.machineNumber = jobMachineTime[0] ? jobMachineTime[0][0].length : 9
    this.initializeData()
  }

  initializeData() {
    this.jobMachine = []
    this.jobTime = []

    for (let i = 0; i < this.jobNumber; i++) {
      this.jobMachine[i] = []
      this.jobTime[i] = []
      for (let j = 0; j < this.jobMachineTime[i].length; j++) {
        this.jobMachine[i][j] = []
        this.jobTime[i][j] = []
        for (let k = 0; k < this.jobMachineTime[i][j].length; k++) {
          if (this.jobMachineTime[i][j][k] !== -1) {
            this.jobMachine[i][j].push(k)
            this.jobTime[i][j].push(this.jobMachineTime[i][j][k])
          }
        }
      }
    }
    this.reset()
  }

  reset() {
    this.jobStartTime = Array(this.jobNumber)
      .fill()
      .map((_, i) => Array(this.jobMachineTime[i].length).fill(0))
    this.jobEndTime = Array(this.jobNumber)
      .fill()
      .map((_, i) => Array(this.jobMachineTime[i].length).fill(0))
    this.machineStartTime = Array(this.machineNumber).fill(0)
    this.machineEndTime = Array(this.machineNumber).fill(0)
    this.agvStartTime = Array(this.agvNumber).fill(0)
    this.agvEndTime = Array(this.agvNumber).fill(0)
    this.agvLocation = Array(this.agvNumber).fill(this.machineNumber)
    this.agvProcessRecord = Array(this.agvNumber)
      .fill()
      .map(() => [])
    this.jobProcessRecord = Array(this.jobNumber).fill(0)
    this.jobWhatMachine = Array(this.jobNumber)
      .fill()
      .map((_, i) => Array(this.jobMachineTime[i].length).fill(0))
    this.agvFirstUse = Array(this.agvNumber).fill(false)
  }

  tripleCode() {
    const record = Array(this.jobNumber).fill(0)
    const codes = []

    for (let i = 0; i < this.jobNumber; i++) {
      for (let j = 0; j < this.jobMachineTime[i].length; j++) {
        codes.push(i)
      }
    }

    this.shuffleArray(codes)

    const machines = []
    codes.forEach((jobId) => {
      const process = record[jobId]
      const availableMachines = this.jobMachine[jobId][process]
      machines.push(availableMachines[Math.floor(Math.random() * availableMachines.length)])
      record[jobId]++
    })

    const agvCode = codes.map(() => Math.floor(Math.random() * this.agvNumber))
    return [codes, machines, agvCode]
  }

  decode(codes) {
    this.reset()

    for (let i = 0; i < codes[0].length; i++) {
      const job = codes[0][i]
      const nextMachine = codes[1][i]
      const agv = codes[2][i]
      const process = this.jobProcessRecord[job]

      if (process === 0) {
        this.processFirstOperation(job, nextMachine, agv, process)
      } else {
        this.processSubsequentOperation(job, nextMachine, agv, process)
      }

      this.updateMachineAndJobTimes(job, nextMachine, process)
    }
  }

  processFirstOperation(job, nextMachine, agv, process) {
    const startLocation = this.machineNumber

    if (!this.agvFirstUse[agv]) {
      this.agvStartTime[agv] = 0
      this.agvEndTime[agv] = this.travelTime[startLocation][nextMachine]
      this.agvFirstUse[agv] = true
    } else {
      this.agvStartTime[agv] =
        this.agvEndTime[agv] + this.travelTime[this.agvLocation[agv]][startLocation]
      this.agvEndTime[agv] = this.agvStartTime[agv] + this.travelTime[startLocation][nextMachine]
    }

    this.jobStartTime[job][process] = Math.max(
      this.machineEndTime[nextMachine],
      this.agvEndTime[agv],
    )

    this.agvProcessRecord[agv].push([
      this.agvStartTime[agv],
      this.agvEndTime[agv],
      startLocation,
      nextMachine,
      [job, process],
    ])

    this.agvLocation[agv] = nextMachine
  }

  processSubsequentOperation(job, nextMachine, agv, process) {
    const currentMachine = this.jobWhatMachine[job][process - 1]

    if (currentMachine !== nextMachine) {
      this.agvStartTime[agv] = Math.max(
        this.jobEndTime[job][process - 1],
        this.agvEndTime[agv] + this.travelTime[this.agvLocation[agv]][currentMachine],
      )

      this.agvEndTime[agv] = this.agvStartTime[agv] + this.travelTime[currentMachine][nextMachine]

      this.agvProcessRecord[agv].push([
        this.agvStartTime[agv],
        this.agvEndTime[agv],
        currentMachine,
        nextMachine,
        [job, process],
      ])

      this.agvLocation[agv] = nextMachine

      this.jobStartTime[job][process] = Math.max(
        this.machineEndTime[nextMachine],
        this.agvEndTime[agv],
      )
    } else {
      this.jobStartTime[job][process] = this.machineEndTime[nextMachine]
    }
  }

  updateMachineAndJobTimes(job, nextMachine, process) {
    const machineIndex = this.jobMachine[job][process].indexOf(nextMachine)
    this.jobEndTime[job][process] =
      this.jobStartTime[job][process] + this.jobTime[job][process][machineIndex]

    this.jobProcessRecord[job]++
    this.jobWhatMachine[job][process] = nextMachine
    this.machineStartTime[nextMachine] = this.jobStartTime[job][process]
    this.machineEndTime[nextMachine] = this.jobEndTime[job][process]
  }

  getFitness() {
    return 1 / Math.max(...this.machineEndTime)
  }

  generateGanttData() {
    const datasource = []
    let num = 0

    for (let i = 0; i < this.jobStartTime.length; i++) {
      for (let j = 0; j < this.jobStartTime[i].length; j++) {
        datasource.push({
          workpiece: i,
          process: j,
          machine: this.jobWhatMachine[i][j],
          startTime: Math.round(this.jobStartTime[i][j]),
          endTime: Math.round(this.jobEndTime[i][j]),
          duration: Math.round(this.jobEndTime[i][j] - this.jobStartTime[i][j]),
        })
        num++
      }
    }

    for (let i = 0; i < this.agvProcessRecord.length; i++) {
      for (let j = 0; j < this.agvProcessRecord[i].length; j++) {
        datasource.push({
          workpiece: num + i,
          process: j,
          machine: this.agvProcessRecord[i][j][3],
          startTime: Math.round(this.agvProcessRecord[i][j][0]),
          endTime: Math.round(this.agvProcessRecord[i][j][1]),
          duration: Math.round(this.agvProcessRecord[i][j][1] - this.agvProcessRecord[i][j][0]),
        })
      }
    }

    return datasource
  }

  generateScheduleData() {
    const scheduleData = []

    for (let i = 0; i < this.agvProcessRecord.length; i++) {
      for (let j = 0; j < this.agvProcessRecord[i].length; j++) {
        const record = this.agvProcessRecord[i][j]
        const jobInfo = record[4]

        let command = ''
        if (j === 0) {
          command = `start -> 工位${record[3] + 1}`
        } else {
          const prevRecord = this.agvProcessRecord[i][j - 1]
          command = `工位${prevRecord[3] + 1} -> 工位${record[3] + 1}`
        }

        scheduleData.push({
          number: i + 1,
          start: Math.round(record[0]),
          end: Math.round(record[1]),
          job: `产品${jobInfo[0] + 1}`,
          command: command,
        })
      }
    }

    return scheduleData
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }
}

// 简化版遗传算法（减少计算量）
class GAwithAGVstep {
  constructor(populationNum, crossOdd, mutationOdd, loopTime, breakValue, fjsp) {
    this.fjsp = fjsp
    this.popNum = populationNum
    this.crossOdd = crossOdd
    this.mutaOdd = mutationOdd
    this.loop = loopTime
    this.breakValue = breakValue
    this.population = Array(this.popNum)
      .fill()
      .map(() => this.fjsp.tripleCode())
    this.convergenceData = []
  }

  main() {
    for (let i = 0; i < this.loop; i++) {
      const fitness = []

      // 每10代报告一次进度
      if (i % 10 === 0) {
        self.postMessage({
          type: 'progress',
          progress: ((i / this.loop) * 100).toFixed(1),
          generation: i,
        })
      }

      for (const individual of this.population) {
        this.fjsp.decode(individual)
        fitness.push(this.fjsp.getFitness())
        this.fjsp.reset()
      }

      const bestFitness = Math.max(...fitness)
      this.convergenceData.push([i, 1 / bestFitness])

      if (1 / bestFitness <= this.breakValue) {
        const bestIndex = fitness.indexOf(bestFitness)
        this.fjsp.decode(this.population[bestIndex])
        return { fitness: 1 / bestFitness, individual: this.population[bestIndex] }
      }

      // 简化的进化操作
      this.evolve(fitness)
    }

    const finalFitness = []
    for (const individual of this.population) {
      this.fjsp.decode(individual)
      finalFitness.push(1 / this.fjsp.getFitness())
      this.fjsp.reset()
    }

    const bestIndex = finalFitness.indexOf(Math.min(...finalFitness))
    return {
      fitness: finalFitness[bestIndex],
      individual: this.population[bestIndex],
    }
  }

  evolve(fitness) {
    const newPop = []
    const sortedIndices = fitness
      .map((f, i) => ({ fitness: f, index: i }))
      .sort((a, b) => b.fitness - a.fitness)

    // 保留最优个体
    for (let i = 0; i < Math.floor(this.popNum * 0.2); i++) {
      newPop.push(JSON.parse(JSON.stringify(this.population[sortedIndices[i].index])))
    }

    // 生成新个体
    while (newPop.length < this.popNum) {
      const parent1 =
        this.population[
          sortedIndices[Math.floor(Math.random() * Math.floor(this.popNum * 0.5))].index
        ]
      const parent2 =
        this.population[
          sortedIndices[Math.floor(Math.random() * Math.floor(this.popNum * 0.5))].index
        ]

      let offspring = JSON.parse(JSON.stringify(parent1))

      if (Math.random() < this.crossOdd) {
        offspring = this.simpleCrossover(parent1, parent2)
      }

      if (Math.random() < this.mutaOdd) {
        offspring = this.simpleMutation(offspring)
      }

      newPop.push(offspring)
    }

    this.population = newPop
  }

  simpleCrossover(parent1, parent2) {
    const offspring = JSON.parse(JSON.stringify(parent1))
    const crossPoint = Math.floor(Math.random() * offspring[0].length)

    for (let i = crossPoint; i < offspring[0].length; i++) {
      offspring[1][i] = parent2[1][i]
      offspring[2][i] = parent2[2][i]
    }

    return offspring
  }

  simpleMutation(individual) {
    const mutated = JSON.parse(JSON.stringify(individual))

    if (Math.random() < 0.5) {
      const pos = Math.floor(Math.random() * mutated[0].length)
      mutated[2][pos] = Math.floor(Math.random() * this.fjsp.agvNumber)
    }

    if (Math.random() < 0.5) {
      const pos = Math.floor(Math.random() * mutated[0].length)
      const job = mutated[0][pos]
      let process = 0
      for (let i = 0; i < pos; i++) {
        if (mutated[0][i] === job) process++
      }

      if (this.fjsp.jobMachine[job] && this.fjsp.jobMachine[job][process]) {
        const availableMachines = this.fjsp.jobMachine[job][process]
        if (availableMachines.length > 0) {
          mutated[1][pos] = availableMachines[Math.floor(Math.random() * availableMachines.length)]
        }
      }
    }

    return mutated
  }
}

// Worker 消息处理
self.onmessage = function (e) {
  const { AGVNum, equipNum } = e.data

  try {
    // 生成数据
    const jobMachineTime = generateJobMachineData(5, equipNum)
    const travelTime = generateTravelTime(equipNum)

    // 创建算法实例
    const fjsp = new FJSPwithAGV(jobMachineTime, AGVNum, travelTime)
    const ga = new GAwithAGVstep(30, 0.8, 0.3, 50, 45, fjsp) // 减少参数以提高速度

    // 执行算法
    const result = ga.main()
    fjsp.decode(result.individual)

    // 生成结果数据
    const scheduleData = fjsp.generateScheduleData()
    const ganttData = fjsp.generateGanttData()
    const strategyData = generateStrategyData(fjsp, 5)

    // 发送结果
    self.postMessage({
      type: 'result',
      data: {
        scheduleData,
        strategyData,
        convergenceData: ga.convergenceData,
        ganttData,
        productCount: 5,
        machineCount: equipNum,
      },
    })
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
    })
  }
}

// 数据生成函数
function generateJobMachineData(jobCount, machineCount) {
  const jobMachineTemplates = {
    3: [
      [5, 8, 11, -1, -1, -1, -1, -1, 9],
      [-1, -1, -1, 4, 6, 4, -1, -1, -1],
      [6, -1, -1, -1, 5, -1, -1, 7, -1],
      [-1, -1, 5, -1, -1, 5, -1, 8, -1],
      [11, -1, -1, 9, 4, 8, -1, -1, -1],
    ],
    4: [
      [5, 4, -1, -1, -1, -1, -1, -1, 7],
      [-1, 7, -1, 6, -1, -1, 10, -1, -1],
      [-1, -1, -1, 5, -1, -1, 6, -1, -1],
      [10, -1, -1, -1, 9, -1, 11, -1, -1],
    ],
    5: [
      [15, 9, -1, -1, -1, -1, -1, -1, 13],
      [14, -1, 17, -1, -1, -1, 19, -1, -1],
    ],
    6: [
      [-1, -1, -1, 7, -1, -1, -1, -1, 5],
      [-1, -1, 13, -1, 10, -1, -1, 8, -1],
      [13, -1, 11, -1, -1, -1, 10, -1, -1],
      [-1, -1, 12, -1, -1, -1, -1, 9, -1],
      [-1, 9, -1, -1, -1, -1, 15, 6, -1],
    ],
  }

  const jobMachine = []
  const productTypes = [3, 4, 5, 6]

  for (let i = 0; i < jobCount; i++) {
    const productType = productTypes[i % productTypes.length]
    const template = jobMachineTemplates[productType]
    const jobData = template.map((row) => row.slice(0, machineCount))
    jobMachine.push(jobData)
  }

  return jobMachine
}

function generateTravelTime(machineCount) {
  const positionAll = [
    [2, 8],
    [7, 6],
    [2, 5],
    [7, 9],
    [4, 2],
    [5, 7],
    [1, 3],
    [6, 4],
    [3, 5],
  ]

  const position = positionAll.slice(0, machineCount)
  position.push([0, 0])

  const agvVel = 1
  const travelTime = []

  for (let i = 0; i < position.length; i++) {
    const row = []
    for (let j = 0; j < position.length; j++) {
      const distance =
        Math.abs(position[i][0] - position[j][0]) + Math.abs(position[i][1] - position[j][1])
      row.push(distance / agvVel)
    }
    travelTime.push(row)
  }

  return travelTime
}

function generateStrategyData(fjsp, jobCount) {
  const strategyData = []

  for (let i = 0; i < jobCount; i++) {
    const data = []
    for (let j = 0; j < fjsp.jobStartTime[i].length; j++) {
      data.push([Math.round(fjsp.jobStartTime[i][j]), fjsp.jobWhatMachine[i][j]])
      data.push([Math.round(fjsp.jobEndTime[i][j]), fjsp.jobWhatMachine[i][j]])
    }
    strategyData.push(data)
  }

  return strategyData
}
