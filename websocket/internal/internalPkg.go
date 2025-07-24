package internal

import (
	"math/rand"
	"time"
)

func GeneratePosition() int {
	rand.Seed(time.Now().UnixNano())
	//flag := false
	for {
		num := rand.Intn(100) + 1
		//if !used[num] {
		//	used[num] = true
		//	flag = true
		return num
		//}
	}
}
