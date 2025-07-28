package internal

import (
	"math/rand"
	"time"
)

func GeneratePosition() float64 {
	rand.Seed(time.Now().UnixNano())
	//flag := false
	for {
		num := rand.Intn(100) + 1
		//if !used[num] {
		//	used[num] = true
		//	flag = true
		return float64(num)
		//}
	}
}
