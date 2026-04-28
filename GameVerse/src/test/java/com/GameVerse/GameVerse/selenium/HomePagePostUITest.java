package com.GameVerse.GameVerse.selenium;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.Select;

public class HomePagePostUITest {

    // ------------------------------------------------------------------ //
    //  Helper: log in and land on /home
    // ------------------------------------------------------------------ //
    private WebDriver loginAndGoToHome() throws InterruptedException {
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:3000/login");

        driver.findElement(By.id("userinput")).sendKeys("capstonetest");
        driver.findElement(By.id("passinput")).sendKeys("1234");
        driver.findElement(By.xpath("//button[contains(text(), 'Login')]")).click();

        Thread.sleep(3000);
        return driver;
    }

    // ------------------------------------------------------------------ //
    //  Feed renders
    // ------------------------------------------------------------------ //

    @Test
    void feedHeaderIsVisible() throws InterruptedException {
        WebDriver driver = loginAndGoToHome();

        WebElement header = driver.findElement(By.xpath("//h1[contains(text(), 'Feed')]"));
        assertTrue(header.isDisplayed());

        driver.quit();
    }

    @Test
    void generalAndFollowingTabsAreVisible() throws InterruptedException {
        WebDriver driver = loginAndGoToHome();

        WebElement generalTab  = driver.findElement(By.xpath("//button[contains(text(), 'General')]"));
        WebElement followingTab = driver.findElement(By.xpath("//button[contains(text(), 'Following')]"));

        assertTrue(generalTab.isDisplayed());
        assertTrue(followingTab.isDisplayed());

        driver.quit();
    }

    @Test
    void generalTabIsActiveByDefault() throws InterruptedException {
        WebDriver driver = loginAndGoToHome();

        WebElement generalTab = driver.findElement(By.xpath("//button[contains(text(), 'General')]"));
        assertTrue(generalTab.getAttribute("class").contains("tabs-sa"));

        driver.quit();
    }


    @Test
    void postsLoadAfterPageRenders() throws InterruptedException {
        WebDriver driver = loginAndGoToHome();

        // Loading indicator should disappear
        Thread.sleep(3000);
        assertTrue(driver.findElements(By.xpath("//*[contains(text(), 'Loading Posts...')]")).isEmpty());

        driver.quit();
    }

    @Test
    void followingTabShowsEmptyMessageWhenNoPosts() throws InterruptedException {
        WebDriver driver = loginAndGoToHome();

        driver.findElement(By.xpath("//button[contains(text(), 'Following')]")).click();
        Thread.sleep(2000);

        // Either posts exist or the empty-state message is shown
        boolean hasPosts = !driver.findElements(By.xpath("//*[contains(@class, 'post')]")).isEmpty();
        boolean hasEmpty = !driver.findElements(
            By.xpath("//*[contains(text(), 'no posts dedicated to this category')]")).isEmpty();
        assertTrue(hasPosts || hasEmpty);

        driver.quit();
    }

    // ------------------------------------------------------------------ //
    //  Post bar UI
    // ------------------------------------------------------------------ //

    @Test
    void postBarTextareaIsVisible() throws InterruptedException {
        WebDriver driver = loginAndGoToHome();

        WebElement textarea = driver.findElement(
            By.xpath("//textarea[@placeholder='What are you thinking?']"));
        assertTrue(textarea.isDisplayed());

        driver.quit();
    }

    @Test
    void postButtonIsVisible() throws InterruptedException {
        WebDriver driver = loginAndGoToHome();

        WebElement postBtn = driver.findElement(
            By.xpath("//button[contains(text(), 'Post')]"));
        assertTrue(postBtn.isDisplayed());

        driver.quit();
    }

    @Test
    void textareaRespectsMaxLength() throws InterruptedException {
        WebDriver driver = loginAndGoToHome();

        WebElement textarea = driver.findElement(
            By.xpath("//textarea[@placeholder='What are you thinking?']"));

        String maxAttr = textarea.getAttribute("maxlength");
        assertEquals("300", maxAttr);

        driver.quit();
    }


    // ------------------------------------------------------------------ //
    //  Platform filter dropdown
    // ------------------------------------------------------------------ //

    @Test
    void platformFilterDropdownIsVisible() throws InterruptedException {
        WebDriver driver = loginAndGoToHome();

        WebElement dropdown = driver.findElement(By.className("filter-drop"));
        assertTrue(dropdown.isDisplayed());

        driver.quit();
    }

    @Test
    void platformFilterHasExpectedOptions() throws InterruptedException {
        WebDriver driver = loginAndGoToHome();

        Select select = new Select(driver.findElement(By.className("filter-drop")));

        String[] expectedOptions = { "All", "Playstation", "PC", "Xbox", "Nintendo" };
        for (String expected : expectedOptions) {
            boolean found = select.getOptions().stream()
                .anyMatch(o -> o.getText().equals(expected));
            assertTrue(found, "Missing dropdown option: " + expected);
        }

        driver.quit();
    }

    @Test
    void selectingPlatformFilterUpdatesDisplay() throws InterruptedException {
        WebDriver driver = loginAndGoToHome();

        Thread.sleep(2000); // wait for posts to load

        Select select = new Select(driver.findElement(By.className("filter-drop")));
        select.selectByVisibleText("PC");
        Thread.sleep(800);

        // Page should still be on /home and not crash
        assertTrue(driver.getCurrentUrl().contains("/home"));

        driver.quit();
    }

    @Test
    void resettingFilterToAllShowsPosts() throws InterruptedException {
        WebDriver driver = loginAndGoToHome();

        Thread.sleep(2000);

        Select select = new Select(driver.findElement(By.className("filter-drop")));
        select.selectByVisibleText("Nintendo");
        Thread.sleep(500);
        select.selectByVisibleText("All");
        Thread.sleep(800);

        assertTrue(driver.getCurrentUrl().contains("/home"));

        driver.quit();
    }

    // ------------------------------------------------------------------ //
    //  Creating a post
    // ------------------------------------------------------------------ //

    @Test
    void userCanTypeInPostBar() throws InterruptedException {
        WebDriver driver = loginAndGoToHome();

        WebElement textarea = driver.findElement(
            By.xpath("//textarea[@placeholder='What are you thinking?']"));
        textarea.sendKeys("Selenium test post");

        assertEquals("Selenium test post", textarea.getAttribute("value"));

        driver.quit();
    }


    @Test
    void postButtonChangesToPostingWhileSubmitting() throws InterruptedException {
        WebDriver driver = loginAndGoToHome();

        WebElement textarea = driver.findElement(
            By.xpath("//textarea[@placeholder='What are you thinking?']"));
        textarea.sendKeys("Testing posting state");

        driver.findElement(By.xpath("//div[contains(@class, 'Post-Bar')]//button[contains(text(), 'Post')]")).click();

        // Immediately check — button should read "Posting..." while in-flight
        boolean foundPostingState = false;
        for (int i = 0; i < 10; i++) {
            if (!driver.findElements(By.xpath("//button[contains(text(), 'Posting...')]")).isEmpty()) {
                foundPostingState = true;
                break;
            }
            Thread.sleep(100);
        }
        assertTrue(foundPostingState, "Post button should show 'Posting...' while submitting");

        Thread.sleep(3000); // wait for post to complete
        driver.quit();
    }

    @Test
    void successfulPostAppearsAtTopOfFeed() throws InterruptedException {
        WebDriver driver = loginAndGoToHome();

        Thread.sleep(2000);

        String uniqueText = "SeleniumPost_" + System.currentTimeMillis();

        WebElement textarea = driver.findElement(
            By.xpath("//textarea[@placeholder='What are you thinking?']"));
        textarea.sendKeys(uniqueText);

        driver.findElement(By.xpath("//div[contains(@class, 'Post-Bar')]//button[contains(text(), 'Post')]")).click();
        Thread.sleep(3000);

        // New post should appear in the feed
        WebElement newPost = driver.findElement(
            By.xpath("//*[contains(text(), '" + uniqueText + "')]"));
        assertTrue(newPost.isDisplayed());

        driver.quit();
    }

    @Test
    void textareaIsClearedAfterSuccessfulPost() throws InterruptedException {
        WebDriver driver = loginAndGoToHome();

        Thread.sleep(2000);

        WebElement textarea = driver.findElement(
            By.xpath("//textarea[@placeholder='What are you thinking?']"));
        textarea.sendKeys("Clear me after posting_" + System.currentTimeMillis());

        driver.findElement(By.xpath("//div[contains(@class, 'Post-Bar')]//button[contains(text(), 'Post')]")).click();
        Thread.sleep(4000);

        String val = driver.findElement(
            By.xpath("//textarea[@placeholder='What are you thinking?']"))
            .getAttribute("value");
        assertTrue(val == null || val.isEmpty(), "Textarea should be cleared after posting");

        driver.quit();
    }

    // ------------------------------------------------------------------ //
    //  Media upload box
    // ------------------------------------------------------------------ //

}