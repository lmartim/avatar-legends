<template>
  <section class="combat-config">
    <div class="combat-track">
      <div class="boxes">
        <b>Combatants</b>
        <div class="turns-table">
          <div class="default-table" v-if="!combatants?.length">
            Vazio
          </div>
          <div class="turns-table__combatants" v-else>
            <Listbox v-model="selectedCombatant" :options="combatants">
              <template #option="slotProps">
                <div>{{ slotProps.option.character ?? slotProps.option.enemy + ` #${slotProps.option.id}` }}</div>
                <Select v-if="slotProps.option.player" v-model="playersApproaches[slotProps.option.player]" :options="approaches" optionLabel="approach" placeholder="Postura" size="small" />
                <div v-if="slotProps.option.enemy" class="fatigues">
                  <Checkbox v-for="fatigue, key in slotProps.option.fatigue" binary :key="key" />
                </div>
              </template>
            </Listbox>
          </div>
        </div>
      </div>
      <div class="boxes">
        <b>Combat Track</b>
        <div class="turns-table">
          <div class="default-table" v-if="!combatantsOrder?.length">
            Vazio
          </div>
          <div class="turns-table__combatants" v-else>
            <Listbox v-model="selectedCombatantOrder" :options="combatantsOrder">
              <template #option="slotProps">
                <div>{{ slotProps.option.character ?? slotProps.option.enemy + ` #${slotProps.option.id}` }}</div>
              </template>
            </Listbox>
            <!-- <div class="turns-table__combatants__combatant" v-for="combatant, key in combatantsOrder" :key="key" @click="selectCombatant(combatant)">
              <span>{{ combatant.character ?? combatant.enemy + ` #${combatant.id}`  }}</span>
              <span v-tooltip="combatant.enemy ? selectEnemyTechnique(combatant.selectedApproach) + ' - ' + selectEnemyTechniqueDescription(combatant.selectedApproach) : ''">
                {{ combatant.selectedApproach.approach }} 
              </span>
            </div> -->
          </div>
        </div>
      </div>
    </div>
    <div class="combat-config__buttons">
      <Button label="Ordernar" @click="orderCombatants" />
      <Button label="Remover" severity="danger" @click="removeCombatant" />
    </div>
    <div class="listboxes-list">
      <div class="listbox-container boxes">
        <b>Players</b>
        <Listbox v-model="selectedPlayers" :options="players" multiple optionLabel="character" class="listbox" />
      </div>
      <div class="listbox-container boxes">
        <b>Inimigos</b>
        <Listbox v-model="selectedEnemies" :options="enemiesUpdated" multiple class="listbox">
          <template #option="slotProps">
            <div v-tooltip="slotProps.option.description">{{ slotProps.option.enemy }}</div>
          </template>
        </Listbox>
      </div>
    </div>
    <div class="combat-config__buttons">
      <Button label="Adicionar" @click="addToTrack" />
      <Button label="Resetar" severity="danger" @click="resetTrack" />
    </div>
    <div v-if="selectedCombatantOrder && selectedCombatantOrder.enemy" class="default-table">
        <b>{{ selectedCombatantOrder.enemy }} #{{ selectedCombatantOrder.id }}</b>
        <div><b>Abordagem/Movimento</b>: {{ selectedCombatantOrder.selectedApproach.approach }} / {{ selectEnemyTechnique(selectedCombatantOrder.selectedApproach) }}</div>
        <div><b>Descrição</b>: {{ selectEnemyTechniqueDescription(selectedCombatantOrder.selectedApproach) }}</div>
        <div><b>Alvos</b>: {{ selectEnemyTargets() }}</div>
    </div>
  </section>
</template>

<script setup>
  import { onMounted, ref, computed } from 'vue'
  import Listbox from 'primevue/listbox';
  import Button from 'primevue/button';
  import Select from 'primevue/select';
  import Checkbox from 'primevue/checkbox';

  import players from './jsons/players.json'
  import enemies from './jsons/enemies.json'
  import approaches from './jsons/approaches.json'
  import advancedTechniques from './jsons/advancedTechniques.json'

  let combatants = ref([])
  let combatantsOrder = ref([])

  let selectedPlayers = ref()
  let selectedEnemies = ref()
  let selectedCombatant = ref()
  let selectedCombatantOrder = ref()

  let playersApproaches = ref([])

  let fatigues = ref([])

  let playersIndex = ref(100)
  let enemiesIndex = ref(0)

  const enemiesUpdated = computed(() => {
    const enemiesUpdated = []

    enemies.forEach(enemy => {
      const enemyApproaches = updateEnemiesApproaches(enemy);

      enemiesUpdated.push({
        ...enemy,
        approaches: enemyApproaches,
      });
    })

    return enemiesUpdated
  })

  const updateEnemiesApproaches = (enemy) => {
    const availableApproaches = structuredClone(approaches);

    if (enemy.advancedTechniques.length === 0) return availableApproaches

    enemy.advancedTechniques.forEach(advancedTechnique => {
      availableApproaches.forEach(baseApproach => {
        const enemyAdvanceTechnique = advancedTechniques.find(advTechnique => advTechnique.id === advancedTechnique)
        if (baseApproach.id === enemyAdvanceTechnique.approach) {
          baseApproach.techniques.push(enemyAdvanceTechnique)
        }
      })
    })

    return availableApproaches;
  };

  const addToTrack = () => {
    if (!selectedPlayers.value || !selectedEnemies.value) return;

    selectedPlayers.value.forEach((player, index) => {
      playersIndex.value++
      combatants.value.push({ id: playersIndex.value, index: playersIndex.value, ...player })
    })

    selectedEnemies.value.forEach((enemy, index) => {
      enemiesIndex.value++
      combatants.value.push({ id: enemiesIndex.value, index: enemiesIndex.value, ...enemy })
    })

    selectedPlayers.value = []
    selectedEnemies.value = []
  }

  const resetTrack = () => {
    combatants.value = []
    combatantsOrder.value = []

    selectedPlayers.value = []
    selectedEnemies.value = []
    selectedCombatant.value = []
    selectedCombatantOrder.value = []

    playersIndex.value = 100
    enemiesIndex.value = 0
  }

  const selectEnemyApproach = (enemyApproaches) => {
    const firstIndex = Math.floor(Math.random() * enemyApproaches.length);
    return enemyApproaches[firstIndex];
  }

  const selectEnemyTechnique = (enemyApproach) => {
    return enemyApproach.techniques[Math.floor(Math.random() * enemyApproach.techniques.length)].technique
  }

  const selectEnemyTechniqueDescription = (enemyApproach) => {
    return enemyApproach.techniques[Math.floor(Math.random() * enemyApproach.techniques.length)].description
  }

  const selectEnemyTargets = () => {
    const firstTarget = players[Math.floor(Math.random() * players.length)]
    let secondTarget = players[Math.floor(Math.random() * players.length)]

    while (secondTarget == firstTarget)
      secondTarget = players[Math.floor(Math.random() * players.length)]
    
    return `1º ${firstTarget.character} - 2º ${secondTarget.character}` 
  }

  const orderCombatants = () => {
    if (!combatants.value) return;

    combatantsOrder.value = []

    combatants.value.forEach((combatant, index) => {
      combatantsOrder.value.push(combatant)

      if (combatant?.player) {
        if (playersApproaches.value[combatant.player])
          combatantsOrder.value[index]['selectedApproach'] = playersApproaches.value[combatant.player]
        else
          combatantsOrder.value[index]['selectedApproach'] = approaches[Math.floor(Math.random() * approaches.length)]
      }

      if (combatant?.enemy) {
        combatantsOrder.value[index]['selectedApproach'] = selectEnemyApproach(combatant.approaches)
      }
    })

    combatantsOrder.value.sort((a, b) => a.selectedApproach.id - b.selectedApproach.id);
  }

  const combatantName = (combatant) => {
    return combatant.character ?? combatant.enemy
  }

  const removeCombatant = () => {
    if (!selectedCombatant.value) return;
    
    const combatantIndex = combatants.value.findIndex(combatant => combatant.index === selectedCombatant.value.index)
    combatants.value.splice(combatantIndex, 1)

    selectedCombatant.value = []
  }
</script>

<style lang="scss">
.combat-config {
  display: grid;
  row-gap: 16px;

  .default-table {
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    width: 100%;
    text-align: left;
  }

  .boxes {
    width: 100%;
  }

  .combat-track {
    display: flex;
    column-gap: 16px;
    text-align: left;
    width: 100%;

    .turns-table {
      border-radius: 4px;
      width: 100%;
      display: flex;
      justify-content: flex-start;
      text-align: left;

      .p-listbox-list {
        width: 100%;

        .p-listbox-option {
          width: 100%;
          justify-content: space-between;
        }
      }

      &__combatants {
        display: flex;
        flex-direction: column;
        width: 100%;
        row-gap: 8px;

        &__combatant {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 35px;
        }

        .p-select {
          width: 120px;
        }
      }
    }
  }

  .listboxes-list {
    display: flex;
    column-gap: 16px;
  
    .listbox-container {
      text-align: left;
      
      .listbox {
        width: 100%;
      }
    }
  }

  &__buttons {
    display: flex;
    column-gap: 16px;
  }

  .fatigues {
    display: flex;
    column-gap: 4px;
  }
}

</style>