package com.GameVerse.GameVerse.selenium;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class CommentUITest {

    private WebDriver driver;

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        driver.manage().window().maximize();
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    /**
     * Login helper – MUST match your real login page
     */
    private void login() throws InterruptedException {
        driver.get("http://localhost:3000/login");

        driver.findElement(By.id("userinput")).sendKeys("navbar");
        driver.findElement(By.id("passinput")).sendKeys("1234");
        driver.findElement(By.xpath("//button[contains(text(),'Login')]")).click();

        Thread.sleep(3000);
        assertTrue(driver.getCurrentUrl().contains("/home"));
    }

    @Test
    void userCanAddCommentToPost() throws InterruptedException {
        login();

        // Wait for posts to load
        Thread.sleep(3000);

        // ✅ Open first post’s comment section
        driver.findElement(By.xpath("(//img[contains(@class,'comment')])[1]"))
              .click();

        Thread.sleep(2000);

        // ✅ Find comment textarea (matches your React placeholder)
        driver.findElement(
            By.xpath("//textarea[contains(@placeholder,'Add a comment')]")
        ).sendKeys("selenium comment test");

        // ✅ Click send (message icon)
        driver.findElement(
            By.xpath("//img[contains(@src,'Message')]")
        ).click();

        Thread.sleep(2000);

        // ✅ Assert comment text appears
        assertTrue(
            driver.getPageSource().contains("selenium comment test")
        );
    }
}