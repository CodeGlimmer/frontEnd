// FJSP with AGV 算法实现
export class FJSPwithAGV {
  constructor(jobMachineTime, agvNumber, travelTimeForMachine) {
    this.jobMachineTime = jobMachineTime // 工件在机器上的加工时间
    this.travelTime = travelTimeForMachine // 小车在机器间的行走时间
    this.agvNumber = agvNumber
    this.jobNumber = jobMachineTime.length
    this.machineNumber = jobMachineTime[0] ? jobMachineTime[0][0].length : 9

    // 初始化数据结构
    this.initializeData()
  }

  initializeData() {
    // 工件各工序可选加工机器
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
    // 工件开始、结束时间
    this.jobStartTime = Array(this.jobNumber)
      .fill()
      .map((_, i) => Array(this.jobMachineTime[i].length).fill(0))
    this.jobEndTime = Array(this.jobNumber)
      .fill()
      .map((_, i) => Array(this.jobMachineTime[i].length).fill(0))

    // 机器开始、结束时间
    this.machineStartTime = Array(this.machineNumber).fill(0)
    this.machineEndTime = Array(this.machineNumber).fill(0)

    // AGV开始、结束时间和位置
    this.agvStartTime = Array(this.agvNumber).fill(0)
    this.agvEndTime = Array(this.agvNumber).fill(0)
    this.agvLocation = Array(this.agvNumber).fill(this.machineNumber)

    // 记录数据
    this.agvProcessRecord = Array(this.agvNumber)
      .fill()
      .map(() => [])
    this.jobProcessRecord = Array(this.jobNumber).fill(0)
    this.jobWhatMachine = Array(this.jobNumber)
      .fill()
      .map((_, i) => Array(this.jobMachineTime[i].length).fill(0))

    this.agvFirstUse = Array(this.agvNumber).fill(false)
  }

  // 三层编码：[工件，机器，AGV]
  tripleCode() {
    const record = Array(this.jobNumber).fill(0)
    const codes = []

    // 生成工件序列
    for (let i = 0; i < this.jobNumber; i++) {
      for (let j = 0; j < this.jobMachineTime[i].length; j++) {
        codes.push(i)
      }
    }

    // 随机打乱工件序列
    this.shuffleArray(codes)

    // 机器编码
    const machines = []
    codes.forEach((jobId) => {
      const process = record[jobId]
      const availableMachines = this.jobMachine[jobId][process]
      machines.push(availableMachines[Math.floor(Math.random() * availableMachines.length)])
      record[jobId]++
    })

    // AGV编码
    const agvCode = codes.map(() => Math.floor(Math.random() * this.agvNumber))

    return [codes, machines, agvCode]
  }

  // 解码
  decode(codes) {
    this.reset()

    for (let i = 0; i < codes[0].length; i++) {
      const job = codes[0][i]
      const nextMachine = codes[1][i]
      const agv = codes[2][i]
      const process = this.jobProcessRecord[job]

      if (process === 0) {
        // 第一道工序
        this.processFirstOperation(job, nextMachine, agv, process)
      } else {
        // 后续工序
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

  // 生成甘特图数据
  generateGanttData() {
    const datasource = []
    let num = 0

    // 工件加工数据
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

    // AGV运输数据
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

  // 生成调度表数据
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

// 遗传算法类
export class GAwithAGVstep {
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

  oneLoop(generation) {
    const fitness = []

    for (const individual of this.population) {
      this.fjsp.decode(individual)
      fitness.push(this.fjsp.getFitness())
      this.fjsp.reset()
    }

    // 记录收敛数据
    const bestFitness = Math.max(...fitness)
    this.convergenceData.push([generation, 1 / bestFitness])

    if (1 / bestFitness <= this.breakValue) {
      const bestIndex = fitness.indexOf(bestFitness)
      return { individual: this.population[bestIndex], finished: true }
    }

    // 选择、交叉、变异
    const newPopulation = this.selection(fitness)

    for (let i = 0; i < this.population.length; i++) {
      if (Math.random() < this.crossOdd && i < this.population.length - 1) {
        const [offspring1, offspring2] = this.poxCrossover(newPopulation[i], newPopulation[i + 1])
        newPopulation[i] = offspring1
        newPopulation[i + 1] = offspring2
      }

      if (Math.random() < this.mutaOdd) {
        newPopulation[i] = this.jobMutation(newPopulation[i])
      }
      if (Math.random() < this.mutaOdd) {
        newPopulation[i] = this.machineMutation(newPopulation[i])
      }
      if (Math.random() < this.mutaOdd) {
        newPopulation[i] = this.agvMutation(newPopulation[i])
      }
    }

    this.population = newPopulation
    return { individual: null, finished: false }
  }

  selection(fitness) {
    const selected = []
    const maxF = Math.max(...fitness)
    const minF = Math.min(...fitness)

    if (maxF === minF) {
      // 如果所有适应度值相同，随机选择
      for (let i = 0; i < this.popNum; i++) {
        selected.push(JSON.parse(JSON.stringify(this.population[i])))
      }
      return selected
    }

    const normalizedFitness = fitness.map((f) => (f - minF) / (maxF - minF))

    while (selected.length < this.popNum) {
      for (let i = 0; i < fitness.length && selected.length < this.popNum; i++) {
        if (normalizedFitness[i] > Math.random()) {
          selected.push(JSON.parse(JSON.stringify(this.population[i])))
        }
      }
    }

    return selected.slice(0, this.popNum)
  }

  poxCrossover(parent1, parent2) {
    const code1 = JSON.parse(JSON.stringify(parent1))
    const code2 = JSON.parse(JSON.stringify(parent2))

    if (Math.random() > this.crossOdd) {
      return [code1, code2]
    }

    // 简化的POX交叉
    const crossPoint1 = Math.floor(Math.random() * code1[0].length)
    const crossPoint2 = Math.floor(Math.random() * code1[0].length)
    const start = Math.min(crossPoint1, crossPoint2)
    const end = Math.max(crossPoint1, crossPoint2)

    for (let i = start; i < end; i++) {
      ;[code1[1][i], code2[1][i]] = [code2[1][i], code1[1][i]][(code1[2][i], code2[2][i])] = [
        code2[2][i],
        code1[2][i],
      ]
    }

    return [code1, code2]
  }

  jobMutation(individual) {
    const code = JSON.parse(JSON.stringify(individual))
    const pos1 = Math.floor(Math.random() * code[0].length)
    const pos2 = Math.floor(Math.random() * code[0].length)

    ;[code[0][pos1], code[0][pos2]] = [code[0][pos2], code[0][pos1]]
    return code
  }

  machineMutation(individual) {
    const code = JSON.parse(JSON.stringify(individual))
    const pos = Math.floor(Math.random() * code[0].length)
    const job = code[0][pos]

    let process = 0
    for (let i = 0; i < pos; i++) {
      if (code[0][i] === job) process++
    }

    if (this.fjsp.jobMachine[job] && this.fjsp.jobMachine[job][process]) {
      const availableMachines = this.fjsp.jobMachine[job][process]
      if (availableMachines.length > 0) {
        code[1][pos] = availableMachines[Math.floor(Math.random() * availableMachines.length)]
      }
    }

    return code
  }

  agvMutation(individual) {
    const code = JSON.parse(JSON.stringify(individual))
    const pos = Math.floor(Math.random() * code[0].length)
    code[2][pos] = Math.floor(Math.random() * this.fjsp.agvNumber)
    return code
  }

  main() {
    for (let i = 0; i < this.loop; i++) {
      const result = this.oneLoop(i)
      if (result.finished) {
        this.fjsp.decode(result.individual)
        return { fitness: 1 / this.fjsp.getFitness(), individual: result.individual }
      }
    }

    // 返回最后一代的最优个体
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

  reset() {
    this.population = Array(this.popNum)
      .fill()
      .map(() => this.fjsp.tripleCode())
    this.convergenceData = []
  }
}

// 导出主要接口函数
export async function jfspAlgorithm({ AGVNum, equipNum }) {
  return new Promise((resolve) => {
    try {
      const jobCount = 5
      const jobMachineTime = generateJobMachineData(jobCount, equipNum)
      const travelTime = generateTravelTime(equipNum)

      const fjsp = new FJSPwithAGV(jobMachineTime, AGVNum, travelTime)
      const ga = new GAwithAGVstep(50, 0.8, 0.2, 100, 45, fjsp)

      const result = ga.main()
      fjsp.decode(result.individual)

      const scheduleData = fjsp.generateScheduleData()
      const ganttData = fjsp.generateGanttData()
      const strategyData = generateStrategyData(fjsp, jobCount)

      resolve({
        scheduleData,
        strategyData,
        convergenceData: ga.convergenceData,
        ganttData,
        productCount: jobCount,
        machineCount: equipNum,
      })
    } catch (error) {
      console.error('JFSP算法执行失败:', error)
      resolve({
        scheduleData: [],
        strategyData: [],
        convergenceData: [],
        ganttData: [],
        productCount: 0,
        machineCount: equipNum,
      })
    }
  })
}

// 生成示例数据
function generateJobMachineData(jobCount, machineCount) {
  const jobMachineTemplates = {
    3: [
      // AGV小车
      [5, 8, 11, -1, -1, -1, -1, -1, 9],
      [-1, -1, -1, 4, 6, 4, -1, -1, -1],
      [6, -1, -1, -1, 5, -1, -1, 7, -1],
      [-1, -1, 5, -1, -1, 5, -1, 8, -1],
      [11, -1, -1, 9, 4, 8, -1, -1, -1],
    ],
    4: [
      // 夹爪
      [5, 4, -1, -1, -1, -1, -1, -1, 7],
      [-1, 7, -1, 6, -1, -1, 10, -1, -1],
      [-1, -1, -1, 5, -1, -1, 6, -1, -1],
      [10, -1, -1, -1, 9, -1, 11, -1, -1],
    ],
    5: [
      // 车壳
      [15, 9, -1, -1, -1, -1, -1, -1, 13],
      [14, -1, 17, -1, -1, -1, 19, -1, -1],
    ],
    6: [
      // 车轮
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

// 生成位置和行驶时间
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
  position.push([0, 0]) // AGV起点

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

// 生成策略数据
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
