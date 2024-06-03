package util

import "regexp"

// Function to check if a string contains spaces
func ContainsSpaces(s string) bool {
	// Use a regular expression to check for spaces
	re := regexp.MustCompile(`\s`)
	return re.MatchString(s)
}
