/**
 * @module Pad
 *
 * The Pad function takes a string, a desired length, and an optional padding character,
 * and returns a new string with the original string padded to the desired length.
 *
 * @param Str - The `Str` parameter is a string that you want to pad with
 * additional characters.
 *
 * @param Length - The `Length` parameter is the total length that you want the
 * resulting string to be after padding.
 *
 * @param [Pad= ] - The `Pad` parameter is a string that represents the character(s)
 * used for padding. By default, it is set to a single space character (" ").
 *
 */
export default (Str: string, Length: number, Pad = " ") =>
	Str.padStart((Str.length + Length) / 2, Pad).padEnd(Length, Pad);
