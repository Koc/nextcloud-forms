/**
 * SPDX-FileCopyrightText: 2019 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Vue from 'vue'
import { INPUT_DEBOUNCE_MS } from '../models/Constants.js'

function debounce(fn, delay) {
	let timeoutId = null
	return function () {
		clearTimeout(timeoutId)
		var args = arguments
		var that = this
		timeoutId = setTimeout(function () {
			fn.apply(that, args)
		}, delay)
	}
}

export function debouncedProperty(initialValue, delay = INPUT_DEBOUNCE_MS) {
	let observable = Vue.observable({ value: initialValue })
	return {
		get() {
			return observable.value
		},
		set: debounce(function (newValue) {
			observable.value = newValue
		}, delay),
	}
}
