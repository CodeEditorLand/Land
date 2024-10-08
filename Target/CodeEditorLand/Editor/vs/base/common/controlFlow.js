/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { BugIndicatingError } from './errors.js';
/*
 * This file contains helper classes to manage control flow.
*/
/**
 * Prevents code from being re-entrant.
*/
export class ReentrancyBarrier {
    constructor() {
        this._isOccupied = false;
    }
    /**
     * Calls `runner` if the barrier is not occupied.
     * During the call, the barrier becomes occupied.
     */
    runExclusivelyOrSkip(runner) {
        if (this._isOccupied) {
            return;
        }
        this._isOccupied = true;
        try {
            runner();
        }
        finally {
            this._isOccupied = false;
        }
    }
    /**
     * Calls `runner`. If the barrier is occupied, throws an error.
     * During the call, the barrier becomes active.
     */
    runExclusivelyOrThrow(runner) {
        if (this._isOccupied) {
            throw new BugIndicatingError(`ReentrancyBarrier: reentrant call detected!`);
        }
        this._isOccupied = true;
        try {
            runner();
        }
        finally {
            this._isOccupied = false;
        }
    }
    /**
     * Indicates if some runner occupies this barrier.
    */
    get isOccupied() {
        return this._isOccupied;
    }
    makeExclusiveOrSkip(fn) {
        return ((...args) => {
            if (this._isOccupied) {
                return;
            }
            this._isOccupied = true;
            try {
                return fn(...args);
            }
            finally {
                this._isOccupied = false;
            }
        });
    }
}
