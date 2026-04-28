package com.GameVerse.GameVerse.selenium;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class CommunitiesPageUITest {

    // Helper
    private void login(WebDriver driver) {
        driver.get("http://localhost:3000/login");

        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        WebElement username = wait.until(
            ExpectedConditions.visibilityOfElementLocated(By.id("userinput"))
        );
        WebElement password = driver.findElement(By.id("passinput"));

        username.sendKeys("capstonetest");
        password.sendKeys("1234");

        WebElement loginBtn = wait.until(
            ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(), 'Login')]")
            )
        );

        loginBtn.click();

        wait.until(ExpectedConditions.urlContains("/home"));
    }


    @Test
    void communitiesPageLoads() throws InterruptedException {
        WebDriver driver = new ChromeDriver();
         login(driver);
        driver.get("http://localhost:3000/communities");


        Thread.sleep(1500);

        WebElement header = driver.findElement(By.xpath("//h1[contains(text(), 'Communities')]"));
        assertTrue(header.isDisplayed());

        driver.quit();
    }

    @Test
    void exploreCommunitiesOpensModal() throws InterruptedException {
        WebDriver driver = new ChromeDriver();
        login(driver);
        driver.get("http://localhost:3000/communities");
         

        Thread.sleep(1500);

        WebElement exploreBtn = driver.findElement(By.xpath("//button[contains(text(), 'Explore Communities')]"));
        exploreBtn.click();

        Thread.sleep(800);

        WebElement modal = driver.findElement(By.xpath("//*[contains(@class, 'ExploreCommunities')]"));
        assertTrue(modal.isDisplayed());

        driver.quit();
    }


    @Test
    void featuredCommunitiesSectionLoads() throws InterruptedException {
        WebDriver driver = new ChromeDriver();
        login(driver);
        driver.get("http://localhost:3000/communities");

        Thread.sleep(1500);

        WebElement featuredHeader = driver.findElement(By.xpath("//h2[contains(text(), 'Featured Communities')]"));
        assertTrue(featuredHeader.isDisplayed());

        driver.quit();
    }

    @Test
    void myCommunitiesSectionLoads() throws InterruptedException {
        WebDriver driver = new ChromeDriver();
        login(driver);
        driver.get("http://localhost:3000/communities");

        Thread.sleep(1500);

        WebElement myComHeader = driver.findElement(By.xpath("//h2[contains(text(), 'My Communities')]"));
        WebElement viewAllBtn = driver.findElement(By.xpath("//button[contains(text(), 'View All')]"));

        assertTrue(myComHeader.isDisplayed());
        assertTrue(viewAllBtn.isDisplayed());

        driver.quit();
    }
}
