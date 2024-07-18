<!--
  - @copyright Copyright (c) 2020 Kostiantyn Miakshyn <molodchick@gmail.com>
  -
  - @author Kostiantyn Miakshyn <molodchick@gmail.com>
  -
  - @license AGPL-3.0-or-later
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as
  - published by the Free Software Foundation, either version 3 of the
  - License, or (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program. If not, see <http://www.gnu.org/licenses/>.
  -
  -->

<template>
	<Question v-bind="questionProps"
		:title-placeholder="answerType.titlePlaceholder"
		v-on="commonListeners"
	>
		<template #actions>
			<NcActionInput
				ref="regexInput"
				:label="t('forms', 'Regular expression for input validation')"
				:value="validationRegex"
				:show-trailing-button="false"
				@input="onInputRegex"
			>
				<template #icon>
					<IconRegex :size="20" />
				</template>
				/^(foo|bar)$/i
				<!-- ^ Some example RegExp for the placeholder text -->
			</NcActionInput>
		</template>

		<div class="question__content" :class="{'hide-question': readOnly}">
			<input ref="input"
				:disabled="!readOnly"
				:name="name || undefined"
				:required="isRequired"
				:value="values[0]"
				type="hidden"
			>
		</div>
	</Question>
</template>

<script>
import {splitRegex, validateExpression} from '../../utils/RegularExpression.js'

import QuestionMixin from '../../mixins/QuestionMixin.js'

import IconRegex from 'vue-material-design-icons/Regex.vue'
import NcActionInput from '@nextcloud/vue/dist/Components/NcActionInput.js'
import {showError} from "@nextcloud/dialogs";
import logger from '../../utils/Logger.js'

export default {
	name: 'QuestionHidden',

	components: {
		IconRegex,
		NcActionInput,
	},

	mixins: [QuestionMixin],

	data() {
		return {}
	},
	computed: {
		validationRegex() {
			return this.extraSettings?.validationRegex || ''
		},
	},

	methods: {
		onInputRegex(event) {
			if (event?.isComposing) {
				return false
			}

			const input = this.$refs.regexInput.$el.querySelector('input')
			const validationRegex = input.value

			// remove potential previous validity
			input.setCustomValidity('')

			if (!validateExpression(validationRegex)) {
				input.setCustomValidity(t('forms', 'Invalid regular expression'))
				return false
			}

			this.onExtraSettingsChange({ validationRegex })
			return true
		},
	},
	mounted() {
		if (!this.readOnly) {
			return
		}

		this.$emit('update:values', [null])

		const tenant = new URLSearchParams(document.location.search).get('tenant');
		if (!tenant) {
			if (this.isRequired) {
				showError(t('forms', 'Tenant not set for a field {field}', {field: this.name}))
				logger.error('Tenant is not set for a field {field}', {field: this.name})
			}

			return
		}

		if (this.validationRegex) {
			const {pattern, modifiers} = splitRegex(this.validationRegex)

			if (!(new RegExp(pattern, modifiers)).test(tenant)) {
				showError(t('forms', 'Invalid value provided for a tenant {field}', {field: this.name}))
				logger.error('Invalid value provided for a tenant {field}', { field: this.name })

				return
			}
		}

		this.$emit('update:values', [tenant])
	}
}
</script>

<style lang="scss" scoped>
:deep(input:invalid) {
	// nextcloud/server#36548
	border-color: var(--color-error)!important;
}
</style>

<style>
.question:has(.hide-question) {
	display: none;
}
</style>
