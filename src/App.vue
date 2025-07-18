<template>
  <section class="combat-config">
    <div class="combat-track">
      <div>
        <b>Combatants</b>
        <div class="turns-table">
          <div class="defaul-table" v-if="!combatants?.length">
            Vazio
          </div>
          <div class="turns-table__combatants" v-else>
            <Listbox v-model="selectedCombatant" :options="combatants">
              <template #option="slotProps">
                <div>{{ slotProps.option.character ?? slotProps.option.enemy + ` #${slotProps.option.id}` }}</div>
                <Select v-if="slotProps.option.player" v-model="playersApproaches[slotProps.option.player]" :options="approaches" optionLabel="approach" placeholder="Postura" size="small" />
                <div v-if="slotProps.option.enemy" class="fatigues">
                  <Checkbox v-for="fatigue, key in slotProps.option.fatigue" v-model="fatigues[key]" binary :key="key" />
                </div>
              </template>
            </Listbox>
          </div>
        </div>
      </div>
      <div>
        <b>Combat Track</b>
        <div class="turns-table defaul-table">
          <div v-if="!combatantsOrder?.length">
            Vazio
          </div>
          <div class="turns-table__combatants" v-else>
            <div class="turns-table__combatants__combatant" v-for="combatant, key in combatantsOrder" :key="key">
              <span>{{ combatant.character ?? combatant.enemy + ` #${combatant.id}`  }}</span>
              <span v-tooltip="combatant.enemy ? selectEnemyTechnique(combatant.selectedApproach) + ' - ' + selectEnemyTechniqueDescription(combatant.selectedApproach) : ''">
                {{ combatant.selectedApproach.approach }} 
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="combat-config__buttons">
      <Button label="Ordernar" @click="orderCombatants" />
      <Button label="Remover" severity="danger" @click="removerCombatant" />
    </div>
    <div class="listboxes-list">
      <div class="listbox-container">
        <b>Players</b>
        <Listbox v-model="selectedPlayers" :options="players" multiple optionLabel="character" class="listbox" />
      </div>
      <div class="listbox-container">
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

  let playersApproaches = ref([])

  let fatigues = ref([])

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


    // // Seleciona o primeiro approach aleatório
    // const firstIndex = Math.floor(Math.random() * availableApproaches.length);
    // const firstApproach = availableApproaches.splice(firstIndex, 1)[0];

    // // Seleciona o segundo approach aleatório (garantido que será diferente)
    // const secondIndex = Math.floor(Math.random() * availableApproaches.length);
    // const secondApproach = availableApproaches.splice(secondIndex, 1)[0];

    // // Atualiza técnicas avançadas se houver
    // [firstApproach, secondApproach].forEach(approach => {
    //   if (enemy.advancedTechniques?.length) {
    //     advancedTechniques.forEach(advanced => {
    //       if (advanced.id === approach.initiaive) {
    //         approach.techniques.push({
    //           technique: advanced.technique,
    //           description: advanced.description,
    //         });
    //       }
    //     });
    //   }
    // });

    return availableApproaches;
  };

  const addToTrack = () => {
    if (!selectedPlayers.value || !selectedEnemies.value) return;

    selectedPlayers.value.forEach((player, index) => {
      combatants.value.push({ id: index + 90, index: index + 90, ...player })
    })

    selectedEnemies.value.forEach((enemy, index) => {
      combatants.value.push({ id: index + 1, index, ...enemy })
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
  }

  const selectEnemyApproach = (enemyApproaches) => {
    const firstIndex = Math.floor(Math.random() * enemyApproaches.length);
    return enemyApproaches[firstIndex];

    // // Seleciona o segundo approach aleatório (garantido que será diferente)
    // const secondIndex = Math.floor(Math.random() * availableApproaches.length);
    // const secondApproach = availableApproaches.splice(secondIndex, 1)[0];

    // // Atualiza técnicas avançadas se houver
    // [firstApproach, secondApproach].forEach(approach => {
    //   if (enemy.advancedTechniques?.length) {
    //     advancedTechniques.forEach(advanced => {
    //       if (advanced.id === approach.initiaive) {
    //         approach.techniques.push({
    //           technique: advanced.technique,
    //           description: advanced.description,
    //         });
    //       }
    //     });
    //   }
    // });
  }

  const selectEnemyTechnique = (enemyApproach) => {
    return enemyApproach.techniques[Math.floor(Math.random() * enemyApproach.techniques.length)].technique
  }

  const selectEnemyTechniqueDescription = (enemyApproach) => {
    return enemyApproach.techniques[Math.floor(Math.random() * enemyApproach.techniques.length)].description
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

  const removerCombatant = () => {
    const combatantIndex = combatants.value.findIndex(combatant => combatant.index === selectedCombatant.value.index)
    combatants.value.splice(combatantIndex, 1)

    selectedCombatant.value = []
  }
</script>

<style lang="scss">
.combat-config {
  display: grid;
  row-gap: 16px;

  .defaul-table {
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    width: 100%;
  }

  .combat-track {
    display: flex;
    column-gap: 16px;
    text-align: left;

    .turns-table {
      border-radius: 4px;
      width: 350px;
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
        width: 350px;
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