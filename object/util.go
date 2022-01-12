// Copyright 2022 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package object

import (
	"context"
	"log"
	"time"

	"github.com/chromedp/chromedp"
)

func getCurrentTime() string {
	timestamp := time.Now().Unix()
	tm := time.Unix(timestamp, 0)
	return tm.Format(time.RFC3339)
}

func getContext() (context.Context, context.CancelFunc) {
	options := append(
		chromedp.DefaultExecAllocatorOptions[:],
		//chromedp.ExecPath("C:\\Users\\Administrator\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe"),
		//chromedp.ExecPath("C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"),
		chromedp.ExecPath("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"),
		chromedp.Flag("headless", true),
		chromedp.Flag("disable-web-security", true),
		chromedp.UserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36"),
		//chromedp.WindowSize(400, 711),
		//chromedp.WindowSize(1920, 1080),
	)
	allocCtx, cancel := chromedp.NewExecAllocator(context.Background(), options...)

	ctx, cancel2 := chromedp.NewContext(allocCtx, chromedp.WithLogf(log.Printf))
	//ctx, cancel2 := chromedp.NewContext(allocCtx, chromedp.WithDebugf(log.Printf))

	// create a timeout
	//ctx, cancel = context.WithTimeout(ctx, 15*time.Second)
	//defer cancel()

	cancelWait := func() {
		cancel()
		cancel2()
	}

	return ctx, cancelWait
}
